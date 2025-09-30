# 🏛️ AI Brief Builder - New Layout Design

## Layout Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AI Brief Builder Interface                           │
├─────────────────────┬───────────────────────────────────────────────────────┤
│                     │                                                       │
│    LEFT SIDEBAR     │              RIGHT DOCUMENT PANEL                    │
│    (320px width)    │              (Full remaining width)                  │
│                     │                                                       │
│  ┌─────────────────┐│  ┌─────────────────────────────────────────────────┐ │
│  │   🏛️ AI Brief   ││  │  Document Header                                │ │
│  │    Builder       ││  │  ┌─────────────────────────────────────────┐   │ │
│  │                  ││  │  │ Section Title                            │   │ │
│  │  Case: Miller v. ││  │  │ Case: Miller v. New York • Supreme Ct   │   │ │
│  │  New York Dept   ││  │  └─────────────────────────────────────────┘   │ │
│  └─────────────────┘│  └─────────────────────────────────────────────────┘ │
│                     │                                                       │
│  ┌─────────────────┐│  ┌─────────────────────────────────────────────────┐ │
│  │ Coherence Score ││  │                                                 │ │
│  │     85%         ││  │           DOCUMENT CONTENT                      │ │
│  │   🟢 Good       ││  │                                                 │ │
│  └─────────────────┘│  │  ┌─────────────────────────────────────────┐   │ │
│                     │  │  │                                         │   │ │
│  📋 Brief Sections  │  │  │  [Professional Legal Document Styling] │   │ │
│                     │  │  │                                         │   │ │
│  • Cover Page       │  │  │  Times New Roman font                   │   │ │
│  • Table of Auth.   │  │  │  1.8 line spacing                      │   │ │
│  • Summary          │  │  │  Clean, document-like appearance       │   │ │
│  • Statement        │  │  │                                         │   │ │
│  • Argument I ⭐    │  │  │  [Editable textarea with professional  │   │ │
│  • Argument II      │  │  │   styling for legal writing]           │   │ │
│  • Argument III     │  │  │                                         │   │ │
│  • Conclusion       │  │  │                                         │   │ │
│  • Certificate      │  │  └─────────────────────────────────────────┘   │ │
│                     │  │                                                 │ │
│  💡 Recommendations │  │  ┌─────────────────────────────────────────┐   │ │
│                     │  │  │ Document Footer                          │   │ │
│  • Strengthen conn. │  │  │ Word count • Last modified • Required   │   │ │
│  • Add conclusion   │  │  └─────────────────────────────────────────┘   │ │
│                     │  └─────────────────────────────────────────────────┘ │
│  ┌─────────────────┐│                                                       │
│  │ 📄 Export Brief ││                                                       │
│  │ 🤖 AI Generate  ││                                                       │
│  └─────────────────┘│                                                       │
└─────────────────────┴───────────────────────────────────────────────────────┘
```

## Key Features

### Left Sidebar (320px)
- **Header**: Brief builder title, case name, template source
- **Coherence Score**: Real-time document quality indicator
- **Section Navigation**: All 9 brief sections with word counts
- **Recommendations**: AI-powered improvement suggestions
- **Action Buttons**: Export brief and AI generation

### Right Document Panel (Flexible Width)
- **Document Header**: Section title, case info, word count
- **Professional Document View**: 
  - Times New Roman font
  - 1.8 line spacing
  - Clean, legal document styling
  - Large editing area (600px min height)
- **Document Footer**: Metadata and section status

## Benefits

1. **Document-Focused**: Right panel looks like a real legal document
2. **Tool-Focused**: Left panel contains all editing tools and controls
3. **Professional Appearance**: Clean, artifact-like document presentation
4. **Efficient Workflow**: Easy section switching with immediate document view
5. **AI Integration**: Coherence monitoring and AI generation readily available

## Navigation

- **No Header Nav**: Removed from this tool for focused experience
- **Back to Home**: Simple navigation back to main site
- **Section-Based**: Navigate through brief sections in left sidebar
- **Real-time Updates**: Document updates immediately in right panel

This layout provides a professional, document-focused experience similar to modern LLM interfaces where the artifact (the brief) is prominently displayed while tools remain accessible in the sidebar.
