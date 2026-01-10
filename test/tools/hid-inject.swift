#!/usr/bin/env swift

import Foundation
import IOKit
import IOKit.hid

// This tool attempts to send HID events that Karabiner might intercept
// by creating a virtual HID event source

// Key code mappings (USB HID usage codes)
let keyCodeMap: [String: UInt32] = [
    "a": 0x04, "b": 0x05, "c": 0x06, "d": 0x07, "e": 0x08,
    "f": 0x09, "g": 0x0A, "h": 0x0B, "i": 0x0C, "j": 0x0D,
    "k": 0x0E, "l": 0x0F, "m": 0x10, "n": 0x11, "o": 0x12,
    "p": 0x13, "q": 0x14, "r": 0x15, "s": 0x16, "t": 0x17,
    "u": 0x18, "v": 0x19, "w": 0x1A, "x": 0x1B, "y": 0x1C,
    "z": 0x1D,
    "1": 0x1E, "2": 0x1F, "3": 0x20, "4": 0x21, "5": 0x22,
    "6": 0x23, "7": 0x24, "8": 0x25, "9": 0x26, "0": 0x27,
    "caps_lock": 0x39,
    "f1": 0x3A, "f2": 0x3B, "f3": 0x3C, "f4": 0x3D,
    "left_arrow": 0x50, "right_arrow": 0x4F,
    "up_arrow": 0x52, "down_arrow": 0x51,
]

func printUsage() {
    print("""
    Usage: hid-inject <key1> [key2] ...

    Attempts to inject HID events at a lower level.
    Note: This may require root privileges or special entitlements.
    """)
}

func main() {
    let args = Array(CommandLine.arguments.dropFirst())

    if args.isEmpty {
        printUsage()
        exit(0)
    }

    // Try to find HID devices
    let matching = IOServiceMatching(kIOHIDDeviceKey)
    var iterator: io_iterator_t = 0

    let result = IOServiceGetMatchingServices(kIOMainPortDefault, matching, &iterator)
    if result != KERN_SUCCESS {
        print("Error: Could not get HID services: \(result)")
        exit(1)
    }

    var deviceCount = 0
    var device = IOIteratorNext(iterator)
    while device != 0 {
        deviceCount += 1

        // Get device name
        if let nameRef = IORegistryEntryCreateCFProperty(device, "Product" as CFString, kCFAllocatorDefault, 0) {
            let name = nameRef.takeRetainedValue() as? String ?? "Unknown"
            if name.contains("Karabiner") {
                print("Found Karabiner device: \(name)")
            }
        }

        IOObjectRelease(device)
        device = IOIteratorNext(iterator)
    }
    IOObjectRelease(iterator)

    print("Found \(deviceCount) HID devices")
    print("")
    print("Note: Direct HID event injection requires kernel-level access.")
    print("Karabiner intercepts at the IOKit HID layer before events reach userspace.")
    print("CGEvent posting happens after Karabiner's interception point.")
    print("")
    print("Alternative approaches:")
    print("1. Use a physical keyboard or USB device simulator")
    print("2. Test the Karabiner configuration logic directly (current approach)")
    print("3. Use Karabiner's EventViewer manually for E2E verification")
}

main()
