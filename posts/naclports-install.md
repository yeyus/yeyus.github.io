Install NaClPorts
-----------------

1. First step is to clone Google's depot_tools repository

  ```
  $ git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git
  ```

2. Now let's export depot_tools in our $PATH

  ```
  export PATH=$HOME/devel/depot_tools:$PATH
  ```

3. We need now to create a .gclient and then sync the repository

  ```
  $ mkdir naclports
  $ cd naclports
  $ gclient config --name=src  https://chromium.googlesource.com/external/naclports.git
  $ gclient sync
  ```

4. Include environment variables that point to our current install of Native Client SDK

  ```
  export NACL_SDK_ROOT=$HOME/devel/nacl_sdk/pepper_43
  ```


### Building naclport's version of cURL

_You might need to install python's colorama in order to be able to use naclports tool. Install it by executing ```pip install colorama```._

```
$ cd naclports/src
$ ./make_all.sh curl
```

Now wait for some good 30min-1hr until everything is built and packaged


### Launch PNaCl version of cURL in OSX

Now we are going to test that the cURL building process worked properly. Let's choose the PNaCl version of the package. Which is probably the trickiest to run as it's a cross architecture compatible _.pexe_ file.

```
$ cd naclports/src/out/publish/curl/pnacl
$ python -m SimpleHTTPServer
```

Now open [http://localhost:8080]()

### Dependencies for building NaClPorts packages

- python 2.7
- gclient (from depot_tools)
- Native Client SDK
- make
- sed
- cmake
- texinfo
- gettext
- pkg-config
- autoconf, automake, libtool


### References

[https://code.google.com/p/naclports/wiki/HowTo_Checkout]()
[http://dev.chromium.org/developers/how-tos/install-depot-tools]()