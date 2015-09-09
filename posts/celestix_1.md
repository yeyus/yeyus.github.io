Unknown HID device reverse engineering
======================================
Recently I got the opportunity to buy a used RSA SecurID appliance without any storage device for a whopping 10$. These 1U boxes are like an enterprise router but with far more resources. The particular box I scored has a Intel Celeron E1500 64bit dual core CPU with virtualization extensions and a 2GB DDR2 module:

```
model name      : Intel(R) Celeron(R) CPU        E1500  @ 2.20GHz
...
flags           : fpu vme de pse tsc msr pae mce cx8 apic sep mtrr pge mca cmov pat pse36 clflush dts acpi mmx fxsr sse sse2 ss ht tm pbe syscall nx lm constant_tsc arch_perfmon pebs bts rep_good nopl aperfmperf pni dtes64 monitor ds_cpl est tm2 ssse3 cx16 xtpr pdcm lahf_lm dtherm
```

I just had to buy a 2.5" 500GB SATA for it and I was done sourcing components for it.

The first thing you notice when researching the unit is a very nice 40x2 alphanumeric LCD plus a jog dial on it, it would be very nice to be able to display custom stuff in there or at least been able to use it with *provided* monitoring software.

The second thing I noticed is that RSA resells machines bought from OEMs and this unit is actually a Celextix MSA series appliance so probably they might provide a comprehensive BSP package but no luck, they don't provide any driver _at_ - _all_ and no luck finding any drivers either on the internets. At some point I found [a pretty good forum thread](https://forum.pfsense.org/index.php?topic=66852.msg511660#msg511660) covering some previous RE attemps by members of the pfSense community.

User *pkirkovsky* did a pretty amazing job figuring the pin out for the module:

```
+--------------------+    PIN   FUNCTION
| 02  04  06  08  10 |   +---+ +--------+
|                    |     01   USB 5v
| 01  03  05  07  09 |     02   USB D-
+--------|  |--------+     03   USB D+
                           04   USB GND
   Connector on PCB        05   LED Green (Power)
                           06   LED Red (Fault)
                           07   LED Ambert (Disk)
          ++               08   System Power (short to GND to boot machine)
+--------------------+     09   3v
| 01  03  05  07  09 |     10   State detect ("System On" -> "System Ready")
|                    |
| 02  04  06  08  10 |     USB is only enabled when "Ready" state is achieved
+--------------------+     When module is outside of system, short pin 10 to any LED
                           to force "Ready" state and USB communication
  Connector on cable
```

So now we know this is going to be a USB device. That hypothesis was also verified previously with a simple

```
$ lsusb
Bus 003 Device 002: ID 0cb6:0002 Celestix Networks, Pte., Ltd
```

Lets try to get more information about the layout of the device and the device config with a more verbose execution:

```
Device Descriptor:
  bLength                18
  bDescriptorType         1
  bcdUSB               1.10
  bDeviceClass            0
  bDeviceSubClass         0
  bDeviceProtocol         0
  bMaxPacketSize0         8
  idVendor           0x0cb6 Celestix Networks, Pte., Ltd
  idProduct          0x0002
  bcdDevice            1.00
  iManufacturer           1 CELESTIX NETWORKS
  iProduct                2 KEYBOARD + LCD
  iSerial                 0
  bNumConfigurations      1
  Configuration Descriptor:
    bLength                 9
    bDescriptorType         2
    wTotalLength           34
    bNumInterfaces          1
    bConfigurationValue     1
    iConfiguration          0
    bmAttributes         0x80
      (Bus Powered)
    MaxPower               50mA
    Interface Descriptor:
      bLength                 9
      bDescriptorType         4
      bInterfaceNumber        0
      bAlternateSetting       0
      bNumEndpoints           1
      bInterfaceClass         3 Human Interface Device
      bInterfaceSubClass      1 Boot Interface Subclass
      bInterfaceProtocol      1 Keyboard
      iInterface              0
        HID Device Descriptor:
          bLength                 9
          bDescriptorType        33
          bcdHID               1.00
          bCountryCode            0 Not supported
          bNumDescriptors         1
          bDescriptorType        34 Report
          wDescriptorLength      62
          Report Descriptor: (length is 62)
            Item(Global): Usage Page, data= [ 0x01 ] 1
                            Generic Desktop Controls
            Item(Local ): Usage, data= [ 0x06 ] 6
                            Keyboard
            Item(Main  ): Collection, data= [ 0x01 ] 1
                            Application
            Item(Global): Report ID, data= [ 0x01 ] 1
            Item(Global): Usage Page, data= [ 0x07 ] 7
                            Keyboard
            Item(Local ): Usage Minimum, data= [ 0xe0 ] 224
                            Control Left
            Item(Local ): Usage Maximum, data= [ 0xe7 ] 231
                            GUI Right
            Item(Global): Logical Minimum, data= [ 0x00 ] 0
            Item(Global): Logical Maximum, data= [ 0x01 ] 1
            Item(Global): Report Size, data= [ 0x01 ] 1
            Item(Global): Report Count, data= [ 0x08 ] 8
            Item(Main  ): Input, data= [ 0x02 ] 2
                            Data Variable Absolute No_Wrap Linear
                            Preferred_State No_Null_Position Non_Volatile Bitfield
            Item(Global): Report Size, data= [ 0x08 ] 8
            Item(Global): Report Count, data= [ 0x01 ] 1
            Item(Global): Logical Minimum, data= [ 0x00 ] 0
            Item(Global): Logical Maximum, data= [ 0x68 ] 104
            Item(Global): Usage Page, data= [ 0x07 ] 7
                            Keyboard
            Item(Local ): Usage Minimum, data= [ 0x00 ] 0
                            No Event
            Item(Local ): Usage Maximum, data= [ 0x68 ] 104
                            F13
            Item(Main  ): Input, data= [ 0x00 ] 0
                            Data Array Absolute No_Wrap Linear
                            Preferred_State No_Null_Position Non_Volatile Bitfield
            Item(Main  ): End Collection, data=none
            Item(Global): Usage Page, data= [ 0x14 ] 20
                            Alphanumeric Display
            Item(Local ): Usage, data= [ 0x01 ] 1
                            Alphanumeric Display
            Item(Main  ): Collection, data= [ 0x01 ] 1
                            Application
            Item(Global): Report ID, data= [ 0x02 ] 2
            Item(Local ): Usage, data= [ 0x2c ] 44
                            Display Data
            Item(Global): Logical Minimum, data= [ 0x80 ] 128
            Item(Global): Logical Maximum, data= [ 0x7f ] 127
            Item(Global): Report Size, data= [ 0x08 ] 8
            Item(Global): Report Count, data= [ 0x58 ] 88
            Item(Main  ): Output, data= [ 0x02 ] 2
                            Data Variable Absolute No_Wrap Linear
                            Preferred_State No_Null_Position Non_Volatile Bitfield
            Item(Main  ): End Collection, data=none
      Endpoint Descriptor:
        bLength                 7
        bDescriptorType         5
        bEndpointAddress     0x81  EP 1 IN
        bmAttributes            3
          Transfer Type            Interrupt
          Synch Type               None
          Usage Type               Data
        wMaxPacketSize     0x0008  1x 8 bytes
        bInterval              10
can't get debug descriptor: Resource temporarily unavailable
Device Status:     0x0000
  (Bus Powered)
```

BINGO! It's a HID USB device! and based on [Frank Zhao's Tutorial about HID descriptors](http://eleccelerator.com/tutorial-about-usb-hid-report-descriptors/), [USB HID Spec](http://www.usb.org/developers/hidpage/HID1_11.pdf) and [HID Usage Tables](http://www.usb.org/developers/hidpage/Hut1_12v2.pdf) this descriptor can be decoded into:

we should have the following descriptor structure

```
USAGE_PAGE (Generic Desktop Controls)
USAGE (Keyboard)
COLLECTION (Application)
  REPORT_ID(1)
  USAGE_PAGE (Keyboard)
  USAGE_MINIMUM(Control Left)
  USAGE_MAXIMUM(GUI Right)
  LOGICAL_MINIMUM(0)
  LOGICAL_MAXIMUM(1)
  REPORT_SIZE(1)
  REPORT_COUNT(8)
  INPUT(Data, Var, Absolute, No Wrap, Linear, Preferred_State, No_Null_Position,Non_Volatile, Bitfield)
  REPORT_SIZE(8)
  REPORT_COUNT(1)
  LOGICAL_MINIMUM(0)
  LOGICAL_MAXIMUM(104)
  USAGE_PAGE (Keyboard)
  USAGE_MINIMUM(0)
  USAGE_MAXIMUM(104)
  INPUT(Data, Array, Absolute, No Wrap, Linear, Preferred_State, No_Null_Position,Non_Volatile, Bitfield)
END COLLECTION
USAGE_PAGE (Alphanumeric Display)
USAGE (Alphanumeric Display)
COLLECTION (Application)
  REPORT_ID(2)
  USAGE(Display Data)
  LOGICAL_MINIMUM(128)
  LOGICAL_MAXIMUM(127)
  REPORT_SIZE(8)
  REPORT_COUNT(88)
  OUTPUT(Data, Var, Absolute, No Wrap, Linear, Preferred_State, No_Null_Position,Non_Volatile, Bitfield)
END COLLECTION
```

So apparently we have a composite device (Keyboard + LCD), Keyboard is an input device and LCD is an output device. Keyboard will produce a 8 fields 1 bit each for the buttons (Left, Right, Enter) and another report 8 bit size ranging from 0 (No Event) to 104 (F13 Key).

### 1st RE attempt - Naive trying

Lets suppose that the 40x2 LCD receives a 80 character payload with the values that we expect it to show. Lets just send the characters to the unit and see if the magic happens... We have 8 bytes remaining to guess, but who cares?.

Other attempts included generating sequential value (0x00 to 0xFF) values to fill the first 8 bytes and filling the 80 remaining characters with 'A' character. No luck but I managed to clear the LCD, maybe I did hit the clear command?.

### 2nd RE attempt - Driver dissassemble

After some pretty intense googling I was able to find an update package for a similar unit provided by the manufacturer and after some decompression I got two _.sys_, _.inf_ and some _.exe_ files. [LCD Driver Download](http://sus2.celestix.com/display.asp?id=CKB200030). This looked promising as I have some real software that I can try with the device at least.

Using IDA Pro I tried to guess how the driver communicates with the hardware without any results, it's clear that I'm not an expert about how WDM api works. But a-much-better idea came to my mind.

### 3rd RE attempt - Sniffing working app

As I told you before this CPU supports virtualization so I came to the point that if I could virtualize a Windows environment running the device driver I found previously and attaching our "unknown USB device" to the VM machine. That way it would be very easy to use tcpdump + usbmon devices to sniff all the usb traffic going through the device.

Finally I got this:

Captured URBs
```
[ ----- CMD prefix ---]   [CPU Temperature: 255 deg C / 491  deg F  ----------------------------------------------------------------------------] [40 null bytes ...]
00:00:00:00:28:00:00:00 . 43:50:55:20:54:65:6d:70:65:72:61:74:75:72:65:3a:20:32:35:35:20:64:65:67:20:43:20:2f:20:34:39:31:20:64:65:67:20:46:20:20:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00
```

```
[ ----- CMD prefix ---]   [SYS Temperature: 255 deg C / 491  deg F  ----------------------------------------------------------------------------] [40 null bytes ...]
00:00:00:01:28:00:00:00 . 53:59:53:20:54:65:6d:70:65:72:61:74:75:72:65:3a:20:32:35:35:20:64:65:67:20:43:20:2f:20:34:39:31:20:64:65:67:20:46:20:20:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00
```

So from that point it was easy to guess the meaning of the remaining 8 bytes, I tried to play with the included software as well as sniffing device initialization but the only payload I could see had always the same structure so we can't determine if the device has more available commands.

Command Format:
```
00:00:00:[LINE]:28:00:00:00
```

From this point implementing a driver using [HID API](http://www.signal11.us/oss/hidapi/) was certainly trivial. I took some time to implement a simple program that will print "Test Test Test" to the LCD and published [here](https://github.com/yeyus/celestix_hid) (GPLv3).

