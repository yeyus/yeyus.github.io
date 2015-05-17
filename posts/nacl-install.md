Install Native Client (NaCl)
----------------------------

1. Download and unzip 

  ```
  $ wget http://storage.googleapis.com/nativeclient-mirror/nacl/nacl_sdk/nacl_sdk.zip
  $ unzip nacl_sdk.zip
  $ cd nacl_sdk
  ```
  _Downloaded package just contains the sdk_tools but we need to download and install the appropriate Pepper SDK package._

2. Tell native client to download Pepper stable package

  ```
  $ ./naclsdk list

  Bundles:
   I: installed
   *: update available

    I  sdk_tools (stable)
       vs_addin (dev)
       pepper_37 (post_stable)
       pepper_38 (post_stable)
       pepper_39 (post_stable)
       pepper_40 (post_stable)
       pepper_41 (post_stable)
       pepper_42 (stable)
       pepper_43 (beta)
       pepper_canary (canary)
       bionic_canary (canary)

  All installed bundles are up-to-date.

  $ ./naclsdk install pepper_42

  Downloading bundle pepper_42
  (file 1/2 - "naclports.tar.bz2")
  |================================================|
  ..................^C
  yeyus@MBP-de-Jesus ~/devel/nacl_sdk % naclsdk: interrupted
  ./naclsdk install pepper_42
  Downloading bundle pepper_42
  (file 1/2 - "naclports.tar.bz2")
  |================================================|
  ..................................................
  (file 2/2 - "naclsdk_mac.tar.bz2")
  |================================================|
  ..................................................
  Updating bundle pepper_42 to version 42, revision 509
  (file 1/2 - "naclports.tar.bz2")
  (file 2/2 - "naclsdk_mac.tar.bz2")
  ```

3. Running a Native Client example

  ```
  $ cd pepper_42/getting_started
  $ make

  ...

    CXX  pnacl/Release/hello_tutorial.o
    LINK pnacl/Release/part2_unstripped.bc
    FINALIZE pnacl/Release/part2_unstripped.pexe
    STRIP pnacl/Release/part2.pexe
    CREATE_NMF pnacl/Release/part2.nmf
  Done building targets.

  $ cd part1
  $ make serve

  ... 
  ```

4. Open [http://localhost:5103/]()

  You should now see 
  > NaCl C++ Tutorial: Getting Started
  > ----------------------------------
  >
  > *Status SUCCESS*