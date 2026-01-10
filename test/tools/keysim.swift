#!/usr/bin/env swift

import Foundation
import CoreGraphics
import ApplicationServices

// MARK: - Key Code Mapping

let keyCodeMap: [String: CGKeyCode] = [
    // Letters
    "a": 0x00, "b": 0x0B, "c": 0x08, "d": 0x02, "e": 0x0E,
    "f": 0x03, "g": 0x05, "h": 0x04, "i": 0x22, "j": 0x26,
    "k": 0x28, "l": 0x25, "m": 0x2E, "n": 0x2D, "o": 0x1F,
    "p": 0x23, "q": 0x0C, "r": 0x0F, "s": 0x01, "t": 0x11,
    "u": 0x20, "v": 0x09, "w": 0x0D, "x": 0x07, "y": 0x10,
    "z": 0x06,

    // Numbers
    "0": 0x1D, "1": 0x12, "2": 0x13, "3": 0x14, "4": 0x15,
    "5": 0x17, "6": 0x16, "7": 0x1A, "8": 0x1C, "9": 0x19,

    // Function keys
    "f1": 0x7A, "f2": 0x78, "f3": 0x63, "f4": 0x76,
    "f5": 0x60, "f6": 0x61, "f7": 0x62, "f8": 0x64,
    "f9": 0x65, "f10": 0x6D, "f11": 0x67, "f12": 0x6F,
    "f13": 0x69, "f14": 0x6B, "f15": 0x71, "f16": 0x6A,
    "f17": 0x40, "f18": 0x4F, "f19": 0x50, "f20": 0x5A,

    // Modifiers
    "caps_lock": 0x39,
    "left_shift": 0x38, "right_shift": 0x3C,
    "left_control": 0x3B, "right_control": 0x3E,
    "left_option": 0x3A, "right_option": 0x3D,
    "left_command": 0x37, "right_command": 0x36,

    // Navigation
    "left_arrow": 0x7B, "right_arrow": 0x7C,
    "up_arrow": 0x7E, "down_arrow": 0x7D,
    "page_up": 0x74, "page_down": 0x79,
    "home": 0x73, "end": 0x77,

    // Special
    "return_or_enter": 0x24, "escape": 0x35, "delete_or_backspace": 0x33,
    "tab": 0x30, "spacebar": 0x31, "hyphen": 0x1B, "equal_sign": 0x18,
    "open_bracket": 0x21, "close_bracket": 0x1E,
    "backslash": 0x2A, "semicolon": 0x29, "quote": 0x27,
    "grave_accent_and_tilde": 0x32, "comma": 0x2B, "period": 0x2F, "slash": 0x2C,
]

// MARK: - CGEvent Helpers

func postKeyEvent(keyCode: CGKeyCode, keyDown: Bool) {
    guard let event = CGEvent(keyboardEventSource: nil, virtualKey: keyCode, keyDown: keyDown) else {
        fputs("Error: Failed to create CGEvent for keyCode \(keyCode)\n", stderr)
        return
    }
    event.post(tap: .cghidEventTap)
}

func tapKey(_ keyCode: CGKeyCode, delayMs: UInt32 = 20) {
    postKeyEvent(keyCode: keyCode, keyDown: true)
    usleep(delayMs * 1000)
    postKeyEvent(keyCode: keyCode, keyDown: false)
    usleep(delayMs * 1000)
}

func holdKey(_ keyCode: CGKeyCode, action: () -> Void) {
    postKeyEvent(keyCode: keyCode, keyDown: true)
    usleep(50_000) // 50ms delay
    action()
    usleep(50_000)
    postKeyEvent(keyCode: keyCode, keyDown: false)
}

// MARK: - Command Parsing

enum Command {
    case tap(CGKeyCode)
    case down(CGKeyCode)
    case up(CGKeyCode)
    case delay(UInt32)
    case checkPermissions
}

func parseCommand(_ arg: String) -> Command? {
    if arg == "--check-permissions" {
        return .checkPermissions
    }

    if arg.hasSuffix("_down") {
        let keyName = String(arg.dropLast(5))
        if let code = keyCodeMap[keyName] {
            return .down(code)
        }
    } else if arg.hasSuffix("_up") {
        let keyName = String(arg.dropLast(3))
        if let code = keyCodeMap[keyName] {
            return .up(code)
        }
    } else if arg.hasPrefix("delay:") {
        if let ms = UInt32(arg.dropFirst(6)) {
            return .delay(ms)
        }
    } else if let code = keyCodeMap[arg] {
        return .tap(code)
    }

    return nil
}

// MARK: - Permission Check

func checkAccessibilityPermissions() -> Bool {
    let options = [kAXTrustedCheckOptionPrompt.takeUnretainedValue() as String: true] as CFDictionary
    return AXIsProcessTrustedWithOptions(options)
}

// MARK: - Main

func printUsage() {
    print("""
    Usage: keysim [options] <key1> [key2] [key3] ...

    Options:
      --check-permissions  Check/request accessibility permissions

    Key formats:
      <key>        Tap key (down then up)
      <key>_down   Press key down (hold)
      <key>_up     Release key
      delay:<ms>   Wait for specified milliseconds

    Examples:
      keysim a b c                    # Tap a, b, c in sequence
      keysim caps_lock_down b caps_lock_up  # Hold caps, tap b, release caps
      keysim caps_lock delay:100 b    # Tap caps, wait 100ms, tap b (leader key style)

    Available keys:
      Letters: a-z
      Numbers: 0-9
      Function: f1-f20
      Modifiers: caps_lock, left_shift, right_shift, left_control, right_control,
                 left_option, right_option, left_command, right_command
      Navigation: left_arrow, right_arrow, up_arrow, down_arrow, page_up, page_down
      Special: return_or_enter, escape, delete_or_backspace, tab, spacebar
    """)
}

func main() {
    let args = Array(CommandLine.arguments.dropFirst())

    if args.isEmpty {
        printUsage()
        exit(0)
    }

    // Parse all commands first
    var commands: [Command] = []
    for arg in args {
        if let cmd = parseCommand(arg) {
            commands.append(cmd)
        } else {
            fputs("Error: Unknown key or command '\(arg)'\n", stderr)
            exit(1)
        }
    }

    // Check for permission check command
    if commands.contains(where: { if case .checkPermissions = $0 { return true }; return false }) {
        let hasPermission = checkAccessibilityPermissions()
        if hasPermission {
            print("OK: Accessibility permissions granted")
            exit(0)
        } else {
            print("PENDING: Accessibility permissions dialog shown - please grant access")
            exit(1)
        }
    }

    // Verify permissions before executing key events
    if !AXIsProcessTrusted() {
        fputs("Error: Accessibility permissions not granted. Run with --check-permissions first.\n", stderr)
        exit(2)
    }

    // Execute commands
    for command in commands {
        switch command {
        case .tap(let keyCode):
            tapKey(keyCode)
        case .down(let keyCode):
            postKeyEvent(keyCode: keyCode, keyDown: true)
            usleep(20_000)
        case .up(let keyCode):
            postKeyEvent(keyCode: keyCode, keyDown: false)
            usleep(20_000)
        case .delay(let ms):
            usleep(ms * 1000)
        case .checkPermissions:
            break // Already handled above
        }
    }

    print("OK")
}

main()
