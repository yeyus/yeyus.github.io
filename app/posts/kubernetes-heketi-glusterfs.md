# GlusterFS support in kubernetes cluster

Almost every single time when running applications on a Kubernetes cluster you will need to rely on some sort of persistent storage. Kubernetes provide such capability through the use of [PersistentVolumes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/). In this post I will set an [StorageClass](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#storageclasses) using [GlusterFS](https://www.gluster.org) as our storage provider.

This will allow the creation of dynamic provisions and provide our payloads with distributed accessible persistent objects.

We need at least 3 gluster nodes in order to allow this deployment otherwise we could have an [split brain](https://gluster.readthedocs.io/en/latest/Administrator%20Guide/Split%20brain%20and%20ways%20to%20deal%20with%20it/) situation where there's no source of quorum as two nodes are diverging on each other.

Easy way of checking that your cluster is working properly
> kubectl run pi --image=perl --restart=OnFailure -- perl -Mbignum=bpi -wle 'print bpi(2000)'

http://blog.lwolf.org/post/how-i-deployed-glusterfs-cluster-to-kubernetes/

## Setup

1. Install glusterfs-fuse to each node

´´´
k8s-nodeX$ yum install glusterfs-fuse
´´´

2. Allow privileged execution in your _nodes_ and _master_

**NODE** Edit your kubelet config file: /etc/kubernetes/kubelet
´´´
KUBELET_ARGS="--allow-privileged"
´´´

then restart your kubelets
```
k8s-nodeX$ systemctl restart kubelet
```

**MASTER** Edit your kube-apiserver config file: /etc/kubernetes/apiserver
```
KUBE_API_ARGS="--allow-privileged"
```

and restart your kube-apiserver
```
k8s-master$ systemctl restart kube-apiserver
```

3. Clone heketi repository into your master
```
k8s-master$ git clone https://github.com/heketi/heketi
k8s-master$ cd heketi/extras/kubernetes
k8s-master$ kubectl create -f glusterfs-daemonser.json

daemonset "glusterfs" created
```

4. Label your _nodes_
```
kubectl label node <node-name> storagenode=glusterfs
```
5. Create service account

```
k8s-master$ kubectl create -f heketi-service-account.json
serviceaccount "heketi-service-account" created
```

6. And create a heketi-deployment

```
k8s-master$ kubectl create -f heketi-deployment.json
secret "heketi-db-backup" created
service "heketi" created
deployment "heketi" created
```

You should have something resembling this:
$ kubectl get pods
```
NAME                      READY     STATUS             RESTARTS   AGE
glusterfs-3cv41           1/1       Running            0          4m
glusterfs-jr59b           1/1       Running            0          4m
glusterfs-kdb63           1/1       Running            0          4m
heketi-3022058288-tlnc8   1/1       Running            0          1m
```

**Troubleshooting**
- If you get a ```CrashLoopBackOff``` state while deploying your heketi pods it might be because of a missing ENV parameter in ```heketi-deployment.json```.

```
$ kubectl logs heketi-30220558288-tlnc8
[kubeexec] ERROR 2017/09/19 06:28:33 /src/github.com/heketi/heketi/executors/kubeexec/kubeexec.go:125: Namespace must be provided in configuration: File /var/run/secrets/kubernetes.io/serviceaccount/namespace not found
[heketi] ERROR 2017/09/19 06:28:33 /src/github.com/heketi/heketi/apps/glusterfs/app.go:87: Namespace must be provided in configuration: File /var/run/secrets/kubernetes.io/serviceaccount/namespace not found
```

It's easily fixable by adding the following variables to the **env** section of ```heketi-deployment.json```
```
{
  "name": "HEKETI_KUBE_NAMESPACE",
  "value": "default"
}
```

- If you get an error creating the heketi replica set like
```
Error creating: No API token found for service account "heketi-service-account", retry after the token is automatically created and added to the service account
```

You need to create a service account key following the instruction in this [GitHub issue](https://github.com/kubernetes/kubernetes/issues/11355#issuecomment-127378691)

6. Forward heketi port in order to initialize heketi and glusterfs

```
$ kubectl port-forward heketi-579277720-kwk5t :8080
Forwarding from 127.0.0.1:36070 -> 8080
Forwarding from [::1]:36070 -> 8080
```

7. Test that heketi is responding

```
$ curl http://localhost:36070/hello
Hello from Heketi
```

8. Export heketi server forwarded endpoint

```
$ export HEKETI_CLI_SERVER=http://localhost:36070
```

9. Create a topology

