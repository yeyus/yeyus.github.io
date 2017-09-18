# Creating a development Kubernetes cluster

## Creating VMs

I used my home ESXi to create 3 modest VMs. I used CentOS 7 but probably other enterprise grade linux distributions would certainly meet all the requirements for a kubernetes cluster.

```
k8s-master: 2 cores, 4GiB RAM, 25GiB thin provisioned
k8s-node1: 2 cores, 2GiB RAM, 25GiB thin provisioned
k8s-node2: 2 cores, 2GiB RAM, 25GiB thin provisioned
```

During the install you will have to configure certain aspects, those are up to you, the only important configuration in this case is to have fixed IP address in order to point _nodes_ to the _master_.

```
k8s-master: 192.168.1.230
k8s-node1: 192.168.1.231
k8s-node2: 192.168.1.232
```

Once the OS installation finalizes we can move into configuring each of the services that have to run into each VM in order to configure a kubernetes cluster.

```
k8s-master:
  - etcd
  - kube-apiserver
  - kube-scheduler
  - kube-controller-manager
```

- *etcd*: is a distributed key-value store that will contain the k8s (kubernetes) configurations and cluster state. It's recomended to use more than one instance of etcd for failure resilience [etcd clustering](https://github.com/coreos/etcd/blob/master/Documentation/op-guide/clustering.md) but 1 in our master is okay for a development cluster.
- *kubernetes-apiserver*: we use kubernetes through the _apiserver_. _kubectl_ connects to it in order to push or pull configurations and query the state of the cluster.
- *kube-scheduler*: this cluster component is the responsible for ordering nodes to assume loads.
- *kube-controller-manager*: It's a daemon that monitors the current state of the cluster and acts on it through the _apiserver_ to move into the desired cluster state.

```
k8s-nodeX:
  - flannel
  - kube-proxy
  - kubelet
  - docker
```

- *flannel*: An _etcd_ backed network fabric for containers. All containers in a k8s cluster must see others in a shared IP space. Some containers could be scheduled into nodes on different networks so it's important to have a service like flannel that creates a flat virtual network topology that will be how containers will communicate.
- *kube-proxy*: is the responsible of exposing our declarated external ports on our services to the host machine.
- *kubelet*: It's the primary node agent that runs on each node. The kubelet receives *PodSpecs* from a master and runs them.
- *docker*: Backend for running containers.

## Master recipe

1. Enable NTP
```
$ yum install ntp
$ systemctl start ntdp
$ systemctl enable ntdp
```

2. Disable firewall
```
$ systemctl stop firewalld
$ systemctl disable firewalld
```

3. Install etcd and kubernetes
```
$ yum install etcd kubernetes
```

4. Configure etcd

/etc/etcd/etcd.conf
```
ETCD_NAME=default
ETCD_DATA_DIR="/var/lib/etcd/default.etcd"
ETCD_LISTEN_CLIENT_URLS="http://0.0.0.0:2379"
ETCD_ADVERTISE_CLIENT_URLS="http://localhost:2379"
```

Make sure that *ETCD_LISTEN_CLIENT_URLS* is set to ```0.0.0.0``` otherwise it won't let other nodes to connect.

5. Configure k8s apiserver

/etc/kubernetes/apiserver
```
KUBE_API_ADDRESS="--address=0.0.0.0"
KUBE_API_PORT="--port=8080"
KUBELET_PORT="--kubelet_port=10250"
KUBE_ETCD_SERVERS="--etcd_servers=http://127.0.0.1:2379"
KUBE_SERVICE_ADDRESSES="--service-cluster-ip-range=10.254.0.0/16"
KUBE_ADMISSION_CONTROL="--admission_control=NamespaceLifecycle,NamespaceExists,LimitRanger,SecurityContextDeny,ResourceQuota"
KUBE_API_ARGS=""
```

6. Start services

We need to start and enable ``` etcd kube-apiserver kube-controller-manager kube-scheduler ```.

7. Create a configuration in _etcd_ for _flannel_

```
$ etcdctl mk /atomic.io/network/config '{"Network":"172.17.0.0/16"}'
```

8. Check that you can access the node list

```
$ kubectl get nodes
```

## Minion recipe

This recipe will enroll a server as a node in our cluster. We will need to disable firewall and enable NTP too. You can repeat the steps in this recipe in as many servers as you like and they will become _minions_ to your master.

1. Install flannel and kubernetes

```
$ yum install flannel kubernetes
```

2. Configure etcd server for flannel

/etc/sysconfig/flanneld
```
FLANNEL_ETCD="http://192.168.1.230:2379"
```

3. Configure kubernetes to connect to the master server

/etc/kubernetes/config
```
KUBE_MASTER="--master=http://192.168.1.230:8080"
```

4. Configure kubelet service

/etc/kubernetes/kubelet
```
KUBELET_ADDRESS="--address=0.0.0.0"
KUBELET_PORT="--port=10250"
KUBELET_HOSTNAME="--hostname_override=<node ip>"
KUBELET_API_SERVER="--api-servers=http://192.168.1.230:8080"
KUBELET_ARGS=""
```

It's important to replace ```<node ip>``` with the appropiate node IP. This override is required as the machines are not assigned a hostname by a custom DNS server.

5. Start services

We need to start and enable ```kube-proxy kubelet docker flanneld```

6. Check your connections list for a _flannel_ interface

```
$ ip a

...

3: flannel0: <POINTTOPOINT,MULTICAST,NOARP,UP,LOWER_UP> mtu 1472 qdisc pfifo_fast state UNKNOWN qlen 500
    link/none
    inet 172.17.38.0/16 scope global flannel0
       valid_lft forever preferred_lft forever
    ...

...
```

7. Check in the master that your nodes are properly initialized
```
$ kubectl get nodes
NAME            STATUS    AGE
192.168.1.231   Ready     5m
192.168.1.232   Ready     2m
```
