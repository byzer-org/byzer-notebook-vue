
export default {
  command: {
    global: [
      {
        shortcut: 'Enter',
        subShortcut: '',
        content: 'hotKeyEditMode',
        frequency: 1
      },
      {
        shortcut: 'Shift-Enter, ⇧-Enter',
        subShortcut: '',
        content: 'hotKeyRunCell',
        frequency: 1
      },
      {
        shortcut: 'E',
        subShortcut: '',
        content: 'hotKeyCodeEditor',
        frequency: 1
      },
      {
        shortcut: 'M',
        subShortcut: '',
        content: 'hotKeyMarkdownEditor',
        frequency: 1
      },
      {
        shortcut: 'F',
        subShortcut: '',
        content: 'hotKeyFindAndReplace',
        frequency: 1
      },
      {
        shortcut: 'A',
        subShortcut: '',
        content: 'hotKeyAddCellAbove',
        frequency: 1
      },
      {
        shortcut: 'B',
        subShortcut: '',
        content: 'hotKeyAddCell',
        frequency: 1
      },
      {
        shortcut: 'D',
        subShortcut: '',
        content: 'hotKeyDeleteCell',
        frequency: 2
      },
      {
        shortcut: 'X',
        subShortcut: '',
        content: 'hotKeyCutCell',
        frequency: 1
      },
      {
        shortcut: 'C',
        subShortcut: '',
        content: 'hotKeyCopyCell',
        frequency: 1
      },
      {
        shortcut: 'Shift-V, ⇧-V',
        subShortcut: '',
        content: 'hotKeyPasteCellAbove',
        frequency: 1
      },
      {
        shortcut: 'V',
        subShortcut: '',
        content: 'hotKeyPasteCell',
        frequency: 1
      },
      {
        shortcut: 'Z',
        subShortcut: '',
        content: 'hotKeyUndoDelete',
        frequency: 1
      },
      {
        shortcut: 'Ctrl-S, ⌘-S',
        subShortcut: 'S',
        content: 'hotKeySave',
        frequency: 1
      },
      {
        shortcut: 'H',
        subShortcut: '',
        content: 'hotKeyShowShortcutHelp',
        frequency: 1
      },
      {
        shortcut: '↑',
        subShortcut: '',
        content: 'hotKeySelectPreviousCell',
        frequency: 1
      },
      {
        shortcut: 'K',
        subShortcut: '',
        content: 'hotKeySelectPreviousCell',
        frequency: 1
      },
      {
        shortcut: '↓',
        subShortcut: '',
        content: 'hotKeySelectNextCell',
        frequency: 1
      },
      {
        shortcut: 'J',
        subShortcut: '',
        content: 'hotKeySelectNextCell',
        frequency: 1
      }
    ],
    md: [
      {
        shortcut: '1',
        subShortcut: '',
        content: 'hotKeyTitleLevel1',
        frequency: 1
      },
      {
        shortcut: '2',
        subShortcut: '',
        content: 'hotKeyTitleLevel2',
        frequency: 1
      },
      {
        shortcut: '3',
        subShortcut: '',
        content: 'hotKeyTitleLevel3',
        frequency: 1
      },
      {
        shortcut: '4',
        subShortcut: '',
        content: 'hotKeyTitleLevel4',
        frequency: 1
      }
    ]
  },
  edit: {
    global: [
      {
        shortcut: 'Esc',
        subShortcut: '',
        content: 'hotKeyCommandMode',
        frequency: 1
      },
      {
        shortcut: 'Ctrl-Home, ⌘-↑',
        subShortcut: '',
        content: 'hotKeyMoveCousorToStartOfCell',
        frequency: 1
      },
      {
        shortcut: 'Ctrl-End, ⌘-↓',
        subShortcut: '',
        content: 'hotKeyMoveCousorToEndOfCell',
        frequency: 1
      },
      {
        shortcut: 'Home, ⌘-←',
        subShortcut: '',
        content: 'hotKeyMoveCousorToStartOfLine',
        frequency: 1
      },
      {
        shortcut: 'End, ⌘-→',
        subShortcut: '',
        content: 'hotKeyMoveCousorToEndOfLine',
        frequency: 1
      },
      {
        shortcut: 'Shift-Enter, ⇧-Enter',
        subShortcut: '',
        content: 'hotKeyRunCell',
        frequency: 1
      },
      {
        shortcut: 'Alt-Space, Option-Space',
        subShortcut: '',
        content: 'hotKeyCodeSuggest',
        frequency: 1
      },
      {
        shortcut: 'Ctrl-/, ⌘-/',
        subShortcut: '',
        content: 'hotKeyToggleLineComment',
        frequency: 1
      },
      {
        shortcut: 'Ctrl-], ⌘-]',
        subShortcut: '',
        content: 'hotKeyIndent',
        frequency: 1
      },
      {
        shortcut: 'Ctrl-[, ⌘-[',
        subShortcut: '',
        content: 'hotKeyUnindent',
        frequency: 1
      },
      {
        shortcut: 'Ctrl-A, ⌘-A',
        subShortcut: '',
        content: 'hotKeySelectAll',
        frequency: 1
      },
      {
        shortcut: 'Ctrl-Z, ⌘-Z',
        subShortcut: '',
        content: 'hotKeyUndo',
        frequency: 1
      },
      {
        shortcut: 'Ctrl-D, ⌘-D',
        subShortcut: '',
        content: 'hotKeyDeleteLine',
        frequency: 1
      },
      {
        shortcut: 'Ctrl-S, ⌘-S',
        subShortcut: '',
        content: 'hotKeySave',
        frequency: 1
      },
      {
        shortcut: '↓',
        subShortcut: '',
        content: 'hotKeyCursorDown',
        frequency: 1
      },
      {
        shortcut: '↑',
        subShortcut: '',
        content: 'hotKeyCursorUp',
        frequency: 1
      }
    ],
    md: [
      {
        shortcut: 'Shift-#, ⇧-#',
        subShortcut: '',
        content: 'hotKeyTitleLevel1',
        frequency: 1
      },
      {
        shortcut: 'Shift-#, ⇧-#',
        subShortcut: '',
        content: 'hotKeyTitleLevel2',
        frequency: 2
      },
      {
        shortcut: 'Shift-#, ⇧-#',
        subShortcut: '',
        content: 'hotKeyTitleLevel3',
        frequency: 3
      },
      {
        shortcut: 'Shift-#, ⇧-#',
        subShortcut: '',
        content: 'hotKeyTitleLevel4',
        frequency: 4
      }
    ]
  }
};
