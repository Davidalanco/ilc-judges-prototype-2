# Development Guidelines - Supreme Legal AI

## 🎨 **GOLDEN RULE: Always Reference the Prototype**

### 📍 **Prototype Location**: `http://localhost:3001/prototype`

**BEFORE making ANY frontend changes, visit the prototype to understand:**
- ✅ Target visual design and styling
- ✅ Expected user interactions and flow  
- ✅ Complete feature set and functionality
- ✅ Mock data structure and format
- ✅ Component layouts and spacing
- ✅ Color schemes and typography

## 🚨 **Critical Development Rules**

### 1. **Design Consistency**
- The `/prototype` page shows the **EXACT** target design
- All frontend changes must **match the prototype styling**
- Preserve the visual hierarchy and component layouts
- Maintain the color scheme and typography

### 2. **Data Structure Preservation**
- Keep the same data structure as shown in prototype
- Maintain the same mock data format when replacing with real APIs
- Preserve the justice analysis card layouts
- Keep the same brief section organization

### 3. **User Experience Continuity**
- Maintain the same interaction patterns shown in prototype
- Preserve the workflow step progression
- Keep the same chat interface behavior
- Maintain the same navigation and button behaviors

### 4. **Component Reference Guide**

#### Justice Analysis Cards
- **Prototype shows**: Alignment percentages, confidence levels, strategy text
- **Implementation**: Match exact card design, colors, and data presentation

#### Workflow Steps
- **Prototype shows**: 11 numbered steps with icons, completion status, expandable content
- **Implementation**: Preserve step numbering, icons, and expansion behavior

#### Brief Sections
- **Prototype shows**: 6 main sections + custom sections, chat interfaces, confidence scores
- **Implementation**: Match section layouts, chat design, and interaction patterns

#### Progress Indicators
- **Prototype shows**: Green checkmarks, progress bars, status badges
- **Implementation**: Use same visual indicators for real progress tracking

## 🔄 **Development Workflow**

### For Frontend Changes:
1. **Visit `/prototype`** - See the target design
2. **Identify components** - Find the specific UI elements you're working on
3. **Note styling details** - Colors, spacing, typography, interactions
4. **Implement with real APIs** - Replace mock data while preserving design
5. **Compare with prototype** - Ensure visual consistency

### For New Features:
1. **Check prototype first** - See if the feature already exists in design
2. **Follow existing patterns** - Use same styling and interaction patterns
3. **Maintain consistency** - Ensure new features match prototype aesthetic

## 📝 **Code Comments for AI Coders**

When working on frontend code, always include comments like:

```typescript
// Design reference: See /prototype for target styling
// This component should match the justice analysis cards in prototype
// Preserve the alignment percentage display and color coding
```

## 🎯 **Quality Assurance**

### Before Committing Frontend Changes:
- [ ] Visited `/prototype` to understand target design
- [ ] Visual design matches prototype styling
- [ ] Interactions behave like prototype shows
- [ ] Data structure preserved from prototype
- [ ] Color scheme and typography consistent
- [ ] Component layouts match prototype

### Testing Checklist:
- [ ] Compare side-by-side with prototype
- [ ] Verify all interactive elements work as shown in prototype
- [ ] Check responsiveness matches prototype behavior
- [ ] Ensure loading states follow prototype patterns

## 🚀 **For AI Coding Assistants**

**MANDATORY STEPS before any frontend development:**

1. **Always mention visiting `/prototype`** in your response
2. **Reference specific prototype elements** you're matching
3. **Preserve the visual design** shown in prototype
4. **Maintain the user experience** demonstrated in prototype
5. **Ask about prototype elements** if unclear about design intentions

**Example AI Response Pattern:**
> "I'll update the workflow page to connect to real APIs. First, let me reference the prototype at `/prototype` to ensure I maintain the exact visual design, especially the justice analysis cards and workflow step progression..."

## 📋 **File Structure Reference**

```
/prototype              # 🎨 VISUAL REFERENCE - Always check this first!
/workflow              # 🔨 Real implementation - Connect to APIs here
/lib/db/               # Database utilities
/app/api/              # Backend API routes
/components/           # Reusable UI components
```

## 🎨 **Design System from Prototype**

Based on the prototype, our design system uses:
- **Primary Color**: Indigo/Blue gradient backgrounds
- **Success Color**: Green for completed items
- **Progress Indicators**: Checkmarks, progress bars, percentage badges
- **Typography**: Clean, professional legal styling
- **Layout**: Card-based design with proper spacing
- **Interactions**: Expandable sections, chat interfaces, hover states

## 🆘 **When in Doubt**

**Always go back to the prototype!** It contains the complete visual specification for the entire application. If there's any uncertainty about how something should look or behave, the prototype is the source of truth.

---

**Remember: The prototype at `/prototype` is your visual north star. Every frontend change should bring the real application closer to matching that target design!** 