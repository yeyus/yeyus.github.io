# Kubernetes TLS setup

[Certificate Generation](https://coreos.com/kubernetes/docs/latest/openssl.html)


## 1. Create a Cluster Root CA

```
$ openssl genrsa -out ca-key.pem 2048
$ openssl req -x509 -new -nodes -key ca-key.pem -days 10000 -out ca.pem -subj "/CN=kube-ca"
```

## 2. Creating certificates for _apiserver_

openssl-apiserver.cnf
```
[req]
req_extensions = v3_req
distinguished_name = req_distinguished_name
[req_distinguished_name]
[ v3_req ]
basicConstraints = CA:FALSE
keyUsage = nonRepudiation, digitalSignature, keyEncipherment
subjectAltName = @alt_names
[alt_names]
DNS.1 = kubernetes
DNS.2 = kubernetes.default
DNS.3 = kubernetes.default.svc
DNS.4 = kubernetes.default.svc.cluster.local
DNS.5 = k8s-master.local
IP.1 = 10.254.0.1
IP.2 = 192.168.1.230
```

IP.1 is the first IP, usually the master in your cluster internal network, and is configured inside the **apiserver**'s config file ```/etc/kubernetes/apiserver```
```
...
KUBE_SERVICE_ADDRESSES="--service-cluster-ip-range=10.254.0.0/16"
...
```

meanwhile IP.2 is your master fully qualified domain, as in the previous post I'm overriding DNS in my home network environment so IP.2 is going to be the master's IP ```192.168.1.230```

```
$ openssl genrsa -out apiserver-key.pem 2048
Generating RSA private key, 2048 bit long modulus
.............+++
.......................................................................................+++
e is 65537 (0x10001)
$ openssl req -new -key apiserver-key.pem -out apiserver.csr -subj "/CN=kube-apiserver" -config openssl.cnf
$ openssl x509 -req -in apiserver.csr -CA ../ca.pem -CAkey ../ca-key.pem -CAcreateserial -out apiserver.pem -days 1095 -extensions v3_req -extfile openssl.cnf
Signature ok
subject=/CN=kube-apiserver
Getting CA Private Key
```

## 3. Creating certificates for _nodes_

```
$ openssl genrsa -out 192.168.1.231-worker-ket.pem 2048
Generating RSA private key, 2048 bit long modulus
..........................+++
...............................................................................+++
e is 65537 (0x10001)

$ openssl genrsa -out 192.168.1.232-worker-ket.pem 2048
Generating RSA private key, 2048 bit long modulus
........+++
.........................+++
e is 65537 (0x10001)

$ openssl genrsa -out 192.168.1.233-worker-ket.pem 2048
Generating RSA private key, 2048 bit long modulus
..............+++
........................................................................+++
e is 65537 (0x10001)

$ openssl req -new -key 192.168.1.231-worker-ket.pem -out 192.168.1.231-worker.csr -subj "/CN=192.168.1.231" -config node-1-openssl.cnf

$ openssl req -new -key 192.168.1.232-worker-ket.pem -out 192.168.1.232-worker.csr -subj "/CN=192.168.1.232" -config node-2-openssl.cnf

$ openssl req -new -key 192.168.1.233-worker-ket.pem -out 192.168.1.233-worker.csr -subj "/CN=192.168.1.233" -config node-3-openssl.cnf

$ openssl x509 -req -in 192.168.1.231-worker.csr -CA ../ca.pem -CAkey ../ca-key.pem  -CAcreateserial -out 192.168.1.231-worker.pem -days 1095 -extensions v3_req -extfile node-1-openssl.cnf
Signature ok
subject=/CN=192.168.1.231
Getting CA Private Key

$ openssl x509 -req -in 192.168.1.232-worker.csr -CA ../ca.pem -CAkey ../ca-key.pem  -CAcreateserial -out 192.168.1.232-worker.pem -days 1095 -extensions v3_req -extfile node-2-openssl.cnf
Signature ok
subject=/CN=192.168.1.232
Getting CA Private Key

$ openssl x509 -req -in 192.168.1.233-worker.csr -CA ../ca.pem -CAkey ../ca-key.pem  -CAcreateserial -out 192.168.1.233-worker.pem -days 1095 -extensions v3_req -extfile node-3-openssl.cnf
Signature ok
subject=/CN=192.168.1.233
Getting CA Private Key
```

## 4. Creating certificates for _admin account_

```
yeyus@k8s-master admin]$ openssl genrsa -out admin-key.pem 2048
Generating RSA private key, 2048 bit long modulus
.....................................................................+++
....................................................+++
e is 65537 (0x10001)
[yeyus@k8s-master admin]$ openssl req -new -key admin-key.pem -out admin.csr -subj "/CN=kube-admin"
[yeyus@k8s-master admin]$ openssl x509 -req -in admin.csr -CA ../ca.pem -CAkey ../ca-key.pem -CAcreateserial -out admin.pem -days 1095
Signature ok
subject=/CN=kube-admin
Getting CA Private Key
```


## 5. Installing certificates in Master node

Copy ```ca.pem apiserver.pem apiserver-key.pem``` into /etc/kubernetes/ssl (create folder if necessary).

Make sure files have proper permissions by running:
```
$ sudo chmod 600 /etc/kubernetes/ssl/*-key.pem
$ sudo chown root:root /etc/kubernetes/ssl/*-key.pem
```

### 5.1 Installing apiserver certificates

Edit /etc/kubernetes/apiserver and add the following arguments to ```KUBE_API_ARGS```
```
--tls-cert-file=/etc/kubernetes/ssl/apiserver.pem --tls-private-key-file=/etc/kubernetes/ssl/apiserver-key.pem --client-ca-file=/etc/kubernetes/ssl/ca.pem
```

restart ```kube-apiserver``` in your **manager**

### 5.2 Installing controller-manager certificates

Edit /etc/kubernetes/controller-manager and add the following arguments to ```KUBE_CONTROLLER_MANAGER_ARGS```
```
--root-ca-file=/etc/kubernetes/ssl/ca.pem
```

restart ```kube-controller-manager``` in your **manager**

## 6. Installing certificates in Worker nodes

**Note**: You should repeat this process for all of your worker nodes.

Copy ```ca.pem 192.168.1.23x-worker.pem 192.168.1.23x-worker-key.pem``` into /etc/kubernetes/ssl (crete folder if necessary).

Edit /etc/kubernetes/kubelet and add the following arguments to ```KUBELET_ARGS```
```
--tls-cert-file=/etc/kubernetes/ssl/192.168.1.23x-worker.pem --tls-private-key-file=/etc/kubernetes/ssl/192.168.1.23x-worker-key.pem
```

restart ```kubelet``` in your **nodes**
