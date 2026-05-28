import { useMemo, useSyncExternalStore, type FC, type ReactNode } from 'react'
import {
  AlignJustify,
  Bell,
  Blocks,
  Check,
  ChevronDown,
  Circle,
  Code2,
  Copy,
  Eye,
  Gauge,
  Image,
  Languages,
  Layers3,
  ListFilter,
  Moon,
  MousePointer2,
  Navigation,
  Package,
  PanelRight,
  Search,
  Sparkles,
  Sun,
  ToggleLeft,
  Type,
  Users,
  Waypoints,
} from 'lucide-react'
import {
  Accordion,
  AlertDialog,
  Autocomplete,
  Avatar,
  AvatarGroup,
  Button,
  Checkbox,
  CheckboxGroup,
  Collapsible,
  Combobox,
  ContextMenu,
  CspProvider,
  Dialog,
  DirectionProvider,
  Drawer,
  Field,
  Fieldset,
  Form,
  Input,
  Menu,
  Menubar,
  Meter,
  NavigationMenu,
  NumberField,
  OtpField,
  Popover,
  PreviewCard,
  Progress,
  Radio,
  RadioGroup,
  ScrollArea,
  Select,
  Separator,
  Slider,
  Switch,
  Tabs,
  Toggle,
  ToastProvider,
  ToggleGroup,
  Toolbar,
  Tooltip,
  useToastManager,
} from './components/ui'
import { ComponentDemo } from './components/ComponentDemo'
import { useLocale, useT } from './i18n'
import { useTheme } from './hooks/useTheme'
import './App.css'
import './styles/shadcn.css'
import './styles/neo-brutalism.css'

type ApiProp = {
  name: string
  type: string
  defaultValue?: string
  description: string
}

type ComponentDoc = {
  id: string
  title: string
  group: 'Inputs' | 'Disclosure' | 'Navigation' | 'Feedback'
  summary: string
  icon: FC<{ size?: number }>
  preview: ReactNode
  code: string
  api: ApiProp[]
  interactions: string[]
}

type SidebarGroup = {
  title: string
  items: ComponentDoc[]
}

const docsRoot = '/components'
const routeChangeEvent = 'bento-route-change'

function navigateTo(path: string) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new Event(routeChangeEvent))
}

function usePathname() {
  return useSyncExternalStore(
    (callback) => {
      window.addEventListener('popstate', callback)
      window.addEventListener(routeChangeEvent, callback)
      return () => {
        window.removeEventListener('popstate', callback)
        window.removeEventListener(routeChangeEvent, callback)
      }
    },
    () => window.location.pathname,
    () => docsRoot,
  )
}

function toComponentPath(id: string) {
  return `${docsRoot}/${id}`
}

function getCurrentId(pathname: string, fallback: string) {
  const match = pathname.match(/^\/components\/([^/]+)$/)
  return match?.[1] ?? fallback
}

function getPage(pathname: string) {
  if (pathname === '/blocks') return 'blocks'
  if (pathname === '/themes') return 'themes'
  if (pathname === '/docs/installation') return 'installation'
  return 'components'
}

function ToastDemoContent() {
  const t = useT()
  const toast = useToastManager()

  return (
    <div className="action-row">
      <Button variant="outline" onClick={() => toast.add(t.extended.toastSaved, t.extended.toastSavedDesc)}>
        <Bell size={15} />{t.extended.toast}
      </Button>
      <Button variant="accent" onClick={() => toast.add(t.extended.toastDeleted, t.extended.toastDeletedDesc)}>
        <Sparkles size={15} />{t.extended.actionToast}
      </Button>
    </div>
  )
}

function useComponentDocs(): ComponentDoc[] {
  const t = useT()

  const densityItems = {
    compact: 'Compact',
    comfortable: 'Comfortable',
    spacious: 'Spacious',
  }

  const radioOptions = [
    { value: 'system', label: 'System' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
  ]

  const toggleOptions = [
    { value: 'bold', label: 'B' },
    { value: 'italic', label: 'I' },
    { value: 'underline', label: 'U' },
  ]

  const comboboxOptions = [
    { value: 'button', label: 'Button' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'dialog', label: 'Dialog' },
    { value: 'select', label: 'Select' },
    { value: 'slider', label: 'Slider' },
    { value: 'tabs', label: 'Tabs' },
    { value: 'toast', label: 'Toast' },
  ]

  const tabPanels = [
    { value: 'usage', label: t.tabs.usage, title: t.tabs.usageTitle, content: t.tabs.usageContent },
    { value: 'states', label: t.tabs.states, title: t.tabs.statesTitle, content: t.tabs.statesContent },
  ]

  const accordionItems = [
    { value: 'a11y', label: t.accordion.a11yLabel, content: t.accordion.a11yContent },
    { value: 'styling', label: t.accordion.stylingLabel, content: t.accordion.stylingContent },
  ]

  const menuItems = [
    { label: t.extended.edit, icon: <Type size={15} /> },
    { label: t.extended.duplicate, icon: <AlignJustify size={15} /> },
    'separator' as const,
    { label: t.extended.archive, icon: <Package size={15} /> },
    { label: t.extended.deleteItem, icon: <Code2 size={15} />, disabled: true },
  ]

  const navItems = [
    { label: t.nav.components, href: toComponentPath('button') },
    {
      label: t.extended.github,
      children: [
        { label: t.extended.docs, href: 'https://base-ui.com' },
        { label: t.extended.github, href: 'https://github.com/mui/base-ui' },
        { label: t.extended.releases, href: 'https://github.com/mui/base-ui/releases' },
      ],
    },
    { label: t.nav.patterns, href: toComponentPath('tabs') },
  ]

  return [
    {
      id: 'button',
      title: 'Button',
      group: 'Inputs',
      summary: 'An action primitive with semantic variants for primary commands, quiet actions, icons, and destructive-looking accents.',
      icon: MousePointer2,
      preview: (
        <div className="action-row">
          <Button variant="primary">Button</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="accent">Accent</Button>
          <Button variant="teal">Teal</Button>
          <Button variant="icon" aria-label="Sparkles"><Sparkles size={16} /></Button>
        </div>
      ),
      code: `import { Button } from './components/ui'

<Button variant="primary">Button</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="accent">Accent</Button>
<Button variant="teal">Teal</Button>
<Button variant="icon" aria-label="Sparkles">
  <Sparkles size={16} />
</Button>`,
      api: [
        { name: 'variant', type: `'primary' | 'outline' | 'ghost' | 'icon' | 'accent' | 'teal'`, defaultValue: `'primary'`, description: 'Controls the visual treatment while keeping native button behavior from Base UI.' },
        { name: 'disabled', type: 'boolean', defaultValue: 'false', description: 'Disables pointer and keyboard activation.' },
        { name: 'children', type: 'ReactNode', description: 'Button label or icon content.' },
      ],
      interactions: ['Press Space or Enter to activate.', 'Use the icon variant with an aria-label.', 'All variants preserve focus-visible styling.'],
    },
    {
      id: 'checkbox', title: 'Checkbox', group: 'Inputs', summary: 'A labeled boolean control with checked and unchecked visual states.', icon: Check,
      preview: <div className="inline-controls"><Checkbox id="cb1" defaultChecked label="Checked" /><Checkbox id="cb2" label="Unchecked" /><Checkbox id="cb3" defaultChecked label="Focus ring" /></div>,
      code: `import { Checkbox } from './components/ui'

<Checkbox id="terms" defaultChecked label="Accept terms" />
<Checkbox id="marketing" label="Marketing emails" />`,
      api: [
        { name: 'label', type: 'string', description: 'Text associated with the checkbox input.' },
        { name: 'defaultChecked', type: 'boolean', defaultValue: 'false', description: 'Initial checked state for uncontrolled usage.' },
        { name: 'id', type: 'string', description: 'Connects the label to the checkbox root.' },
      ],
      interactions: ['Click the label or square to toggle.', 'Press Space while focused to toggle.', 'Disabled state is inherited from Base UI props.'],
    },
    {
      id: 'switch', title: 'Switch', group: 'Inputs', summary: 'A binary setting control for immediate on/off preferences.', icon: ToggleLeft,
      preview: <div className="inline-controls"><Switch id="sw1" defaultChecked label="Motion" /><Switch id="sw2" label="Notifications" /></div>,
      code: `import { Switch } from './components/ui'

<Switch id="motion" defaultChecked label="Motion" />
<Switch id="notifications" label="Notifications" />`,
      api: [
        { name: 'label', type: 'string', description: 'Visible label for the switch.' },
        { name: 'defaultChecked', type: 'boolean', defaultValue: 'false', description: 'Initial uncontrolled state.' },
        { name: 'onCheckedChange', type: '(checked: boolean) => void', description: 'Receives state changes from Base UI.' },
      ],
      interactions: ['Click to toggle.', 'Use Space to toggle while focused.', 'Track and thumb styles respond to data-checked.'],
    },
    {
      id: 'slider', title: 'Slider', group: 'Inputs', summary: 'A range input with Base UI keyboard handling and tokenized track styling.', icon: Gauge,
      preview: <Slider defaultValue={60} min={0} max={100} aria-label="Volume" />,
      code: `import { Slider } from './components/ui'

<Slider defaultValue={60} min={0} max={100} aria-label="Volume" />`,
      api: [
        { name: 'defaultValue', type: 'number | number[]', description: 'Initial uncontrolled value.' },
        { name: 'min / max', type: 'number', defaultValue: '0 / 100', description: 'Allowed value bounds.' },
        { name: 'step', type: 'number', defaultValue: '1', description: 'Value increment for drag and keyboard interaction.' },
      ],
      interactions: ['Drag the thumb to change value.', 'Use arrow keys while focused.', 'Home and End jump to range limits.'],
    },
    {
      id: 'select', title: 'Select', group: 'Inputs', summary: 'A popover-backed single choice control with keyboard navigation and positioned content.', icon: ListFilter,
      preview: <Select id="sel1" items={densityItems} defaultValue="comfortable" label="Density" />,
      code: `import { Select } from './components/ui'

<Select
  id="density"
  items={{ compact: 'Compact', comfortable: 'Comfortable', spacious: 'Spacious' }}
  defaultValue="comfortable"
  label="Density"
/>`,
      api: [
        { name: 'items', type: 'Record<string, string>', description: 'Value-to-label map rendered as selectable items.' },
        { name: 'label', type: 'string', description: 'Optional field label above the trigger.' },
        { name: 'placeholder', type: 'string', description: 'Fallback text when no value is selected.' },
      ],
      interactions: ['Open with mouse down, Enter, Space, or ArrowDown.', 'Move through options with arrow keys.', 'Escape closes the popup without changing selection.'],
    },
    {
      id: 'radiogroup', title: 'Radio Group', group: 'Inputs', summary: 'A grouped set of mutually exclusive choices.', icon: Circle,
      preview: <div><label className="field-label">{t.extended.radioGroup}</label><RadioGroup options={radioOptions} defaultValue="system" /></div>,
      code: `import { RadioGroup } from './components/ui'

<RadioGroup
  options={[
    { value: 'system', label: 'System' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
  ]}
  defaultValue="system"
/>`,
      api: [
        { name: 'options', type: '{ value: string; label: string }[]', description: 'Radio items rendered in order.' },
        { name: 'defaultValue', type: 'string', description: 'Initially selected value.' },
        { name: 'value', type: 'string', description: 'Controlled selected value.' },
      ],
      interactions: ['Arrow keys move selection.', 'Clicking a label selects its value.', 'Only one option may be selected.'],
    },
    {
      id: 'togglegroup', title: 'Toggle Group', group: 'Inputs', summary: 'A compact multi-select control for formatting and segmented actions.', icon: ToggleLeft,
      preview: <div><label className="field-label">{t.extended.toggleGroup}</label><ToggleGroup options={toggleOptions} defaultValue={['bold']} /></div>,
      code: `import { ToggleGroup } from './components/ui'

<ToggleGroup
  options={[
    { value: 'bold', label: 'B' },
    { value: 'italic', label: 'I' },
    { value: 'underline', label: 'U' },
  ]}
  defaultValue={['bold']}
/>`,
      api: [
        { name: 'options', type: '{ value: string; label: string }[]', description: 'Buttons rendered inside the group.' },
        { name: 'defaultValue', type: 'string[]', description: 'Initial selected toggle values.' },
        { name: 'value', type: 'string[]', description: 'Controlled selected values.' },
      ],
      interactions: ['Click a segment to toggle it.', 'Multiple values can stay active.', 'Roving focus works through Base UI.'],
    },
    {
      id: 'combobox', title: 'Combobox', group: 'Inputs', summary: 'A searchable listbox for quickly filtering component names.', icon: Search,
      preview: <Combobox options={comboboxOptions} placeholder={t.extended.searchPlaceholder} label={t.extended.findComponent} />,
      code: `import { Combobox } from './components/ui'

<Combobox
  options={[
    { value: 'button', label: 'Button' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'dialog', label: 'Dialog' },
  ]}
  placeholder="Search components..."
  label="Find a component"
/>`,
      api: [
        { name: 'options', type: '{ value: string; label: string }[]', description: 'Items available in the filtered list.' },
        { name: 'placeholder', type: 'string', defaultValue: `'Search...'`, description: 'Input placeholder.' },
        { name: 'label', type: 'string', description: 'Visible field label.' },
      ],
      interactions: ['Type to filter matching items.', 'Use arrow keys to move through results.', 'Select an item with Enter or pointer.'],
    },
    {
      id: 'input', title: 'Input', group: 'Inputs', summary: 'A styled Base UI input with optional label and helper text slots.', icon: Type,
      preview: <Input id="demo-input" label={t.extended.name} placeholder={t.extended.enterName} />,
      code: `import { Input } from './components/ui'

<Input id="name" label="Name" placeholder="Enter name..." />`,
      api: [
        { name: 'label', type: 'string', description: 'Optional label displayed above the input.' },
        { name: 'placeholder', type: 'string', description: 'Native input placeholder.' },
        { name: 'type', type: 'string', defaultValue: `'text'`, description: 'Native input type passed through to Base UI.' },
      ],
      interactions: ['Focus with Tab.', 'Type directly into the field.', 'Use native validation props when needed.'],
    },
    {
      id: 'autocomplete', title: 'Autocomplete', group: 'Inputs', summary: 'A text input with filtered suggestions and inline selection behavior.', icon: Search,
      preview: <Autocomplete options={comboboxOptions} label="Autocomplete" placeholder="Find component..." openOnInputClick />,
      code: `import { Autocomplete } from './components/ui'

<Autocomplete
  options={[
    { value: 'button', label: 'Button' },
    { value: 'dialog', label: 'Dialog' },
    { value: 'select', label: 'Select' },
  ]}
  label="Autocomplete"
  openOnInputClick
/>`,
      api: [
        { name: 'options', type: '{ value: string; label: string }[]', description: 'Suggestion values displayed in the popup.' },
        { name: 'openOnInputClick', type: 'boolean', defaultValue: 'false', description: 'Opens suggestions when the input is clicked.' },
        { name: 'onValueChange', type: '(value: string) => void', description: 'Called when the input value changes.' },
      ],
      interactions: ['Type to filter suggestions.', 'Arrow through highlighted suggestions.', 'Enter or click selects a suggestion.'],
    },
    {
      id: 'checkboxgroup', title: 'Checkbox Group', group: 'Inputs', summary: 'A shared state container for related checkboxes.', icon: Check,
      preview: <CheckboxGroup defaultValue={['email']} options={[{ value: 'email', label: 'Email' }, { value: 'sms', label: 'SMS' }, { value: 'push', label: 'Push' }]} />,
      code: `import { CheckboxGroup } from './components/ui'

<CheckboxGroup
  defaultValue={['email']}
  options={[
    { value: 'email', label: 'Email' },
    { value: 'sms', label: 'SMS' },
    { value: 'push', label: 'Push' },
  ]}
/>`,
      api: [
        { name: 'options', type: '{ value: string; label: string }[]', description: 'Checkboxes rendered inside the group.' },
        { name: 'defaultValue', type: 'string[]', description: 'Initially checked values.' },
        { name: 'onValueChange', type: '(value: string[]) => void', description: 'Receives the checked values.' },
      ],
      interactions: ['Toggle each checkbox independently.', 'Group value updates as an array.', 'Use disabled to block the whole group.'],
    },
    {
      id: 'field', title: 'Field', group: 'Inputs', summary: 'A form field wrapper that connects label, control, description, and error state.', icon: Type,
      preview: <Field label="Email" description="Used for product updates."><input className="bento-input" placeholder="you@example.com" /></Field>,
      code: `import { Field } from './components/ui'

<Field label="Email" description="Used for product updates.">
  <input className="bento-input" placeholder="you@example.com" />
</Field>`,
      api: [
        { name: 'label', type: 'string', description: 'Accessible label rendered with Field.Label.' },
        { name: 'description', type: 'string', description: 'Optional helper text.' },
        { name: 'error', type: 'string', description: 'Marks the field invalid and renders Field.Error.' },
      ],
      interactions: ['Label focuses the field control.', 'Invalid state propagates through data attributes.', 'Description and error text are associated with the control.'],
    },
    {
      id: 'fieldset', title: 'Fieldset', group: 'Inputs', summary: 'A semantic grouping primitive for related form controls.', icon: Layers3,
      preview: <Fieldset legend="Preferences"><div className="inline-controls"><Checkbox id="fs-mail" label="Email" defaultChecked /><Checkbox id="fs-sms" label="SMS" /></div></Fieldset>,
      code: `import { Fieldset, Checkbox } from './components/ui'

<Fieldset legend="Preferences">
  <Checkbox id="email" label="Email" defaultChecked />
  <Checkbox id="sms" label="SMS" />
</Fieldset>`,
      api: [
        { name: 'legend', type: 'string', description: 'Visible and semantic group title.' },
        { name: 'disabled', type: 'boolean', defaultValue: 'false', description: 'Disables nested controls when passed through.' },
        { name: 'children', type: 'ReactNode', description: 'Grouped form controls.' },
      ],
      interactions: ['Groups related controls for assistive tech.', 'Legend describes the set.', 'Disabled state can be applied to the group.'],
    },
    {
      id: 'form', title: 'Form', group: 'Inputs', summary: 'A form root that integrates Base UI field validation and native submission.', icon: Type,
      preview: <Form onSubmit={(event) => event.preventDefault()}><Field label="Project"><input className="bento-input" required placeholder="Bento docs" /></Field><Button type="submit">Submit</Button></Form>,
      code: `import { Form, Field, Button } from './components/ui'

<Form onSubmit={(event) => event.preventDefault()}>
  <Field label="Project">
    <input className="bento-input" required placeholder="Bento docs" />
  </Field>
  <Button type="submit">Submit</Button>
</Form>`,
      api: [
        { name: 'onSubmit', type: 'FormEventHandler<HTMLFormElement>', description: 'Handles native submit.' },
        { name: 'action', type: 'string', description: 'Native form action target.' },
        { name: 'children', type: 'ReactNode', description: 'Fields and submit actions.' },
      ],
      interactions: ['Press Enter to submit.', 'Native required validation works.', 'Use Field components for validation messaging.'],
    },
    {
      id: 'numberfield', title: 'Number Field', group: 'Inputs', summary: 'A numeric input with increment and decrement controls.', icon: Gauge,
      preview: <NumberField label="Seats" defaultValue={4} min={1} max={20} />,
      code: `import { NumberField } from './components/ui'

<NumberField label="Seats" defaultValue={4} min={1} max={20} />`,
      api: [
        { name: 'defaultValue', type: 'number', description: 'Initial numeric value.' },
        { name: 'min / max', type: 'number', description: 'Value bounds.' },
        { name: 'step', type: 'number', defaultValue: '1', description: 'Increment amount.' },
      ],
      interactions: ['Click plus or minus to change value.', 'Use arrow keys in the input.', 'Value respects min and max bounds.'],
    },
    {
      id: 'otpfield', title: 'OTP Field', group: 'Inputs', summary: 'A one-time-password input with separate slots and paste handling.', icon: Code2,
      preview: <OtpField label="Verification code" length={6} />,
      code: `import { OtpField } from './components/ui'

<OtpField label="Verification code" length={6} />`,
      api: [
        { name: 'length', type: 'number', defaultValue: '6', description: 'Number of visible input slots.' },
        { name: 'validationType', type: `'numeric' | 'alphanumeric' | 'none'`, defaultValue: `'numeric'`, description: 'Allowed input characters.' },
        { name: 'onValueComplete', type: '(value: string) => void', description: 'Called when all slots are filled.' },
      ],
      interactions: ['Type one character per slot.', 'Paste a full code to fill all slots.', 'Backspace moves across slots.'],
    },
    {
      id: 'radio', title: 'Radio', group: 'Inputs', summary: 'A single radio primitive for custom radio group compositions.', icon: Circle,
      preview: <Radio value="single" label="Standalone radio" />,
      code: `import { Radio } from './components/ui'

<Radio value="single" label="Standalone radio" />`,
      api: [
        { name: 'value', type: 'string', description: 'Radio value used by a parent RadioGroup.' },
        { name: 'label', type: 'string', description: 'Optional visible label.' },
        { name: 'disabled', type: 'boolean', defaultValue: 'false', description: 'Disables selection.' },
      ],
      interactions: ['Use inside RadioGroup for selection.', 'Click the label to select.', 'Indicator reflects data-checked.'],
    },
    {
      id: 'separator', title: 'Separator', group: 'Inputs', summary: 'A semantic divider for grouping content and toolbar controls.', icon: AlignJustify,
      preview: <div className="control-stack"><span>Account</span><Separator /><span>Billing</span></div>,
      code: `import { Separator } from './components/ui'

<div>
  <span>Account</span>
  <Separator />
  <span>Billing</span>
</div>`,
      api: [
        { name: 'orientation', type: `'horizontal' | 'vertical'`, defaultValue: `'horizontal'`, description: 'Divider direction.' },
        { name: 'decorative', type: 'boolean', description: 'Marks the separator decorative when appropriate.' },
        { name: 'className', type: 'string', description: 'Optional styling hook.' },
      ],
      interactions: ['Use between visual groups.', 'Vertical orientation works in flex rows.', 'Decorative separators are ignored by assistive tech.'],
    },
    {
      id: 'toggle', title: 'Toggle', group: 'Inputs', summary: 'A single pressable on/off button for formatting and filters.', icon: ToggleLeft,
      preview: <Toggle defaultPressed>Bold</Toggle>,
      code: `import { Toggle } from './components/ui'

<Toggle defaultPressed>Bold</Toggle>`,
      api: [
        { name: 'defaultPressed', type: 'boolean', defaultValue: 'false', description: 'Initial pressed state.' },
        { name: 'pressed', type: 'boolean', description: 'Controlled pressed state.' },
        { name: 'onPressedChange', type: '(pressed: boolean) => void', description: 'Called when state changes.' },
      ],
      interactions: ['Click to toggle pressed state.', 'Space or Enter toggles while focused.', 'Pressed state maps to data-pressed.'],
    },
    {
      id: 'toolbar', title: 'Toolbar', group: 'Inputs', summary: 'A keyboard-aware toolbar for grouped commands and inputs.', icon: AlignJustify,
      preview: <Toolbar />,
      code: `import { Toolbar } from './components/ui'

<Toolbar />`,
      api: [
        { name: 'orientation', type: `'horizontal' | 'vertical'`, defaultValue: `'horizontal'`, description: 'Toolbar navigation direction.' },
        { name: 'showSearch', type: 'boolean', defaultValue: 'true', description: 'Displays the built-in search input.' },
        { name: 'disabled', type: 'boolean', defaultValue: 'false', description: 'Disables toolbar controls.' },
      ],
      interactions: ['Arrow keys move between toolbar items.', 'Buttons are reachable with Tab.', 'Inputs stay editable inside the toolbar.'],
    },
    {
      id: 'cspprovider', title: 'CSP Provider', group: 'Feedback', summary: 'A provider for passing Content Security Policy nonce settings to Base UI internals.', icon: Code2,
      preview: <CspProvider nonce="demo"><Button variant="outline">Nonce provider scope</Button></CspProvider>,
      code: `import { CspProvider } from './components/ui'

<CspProvider nonce={nonceFromServer}>
  <App />
</CspProvider>`,
      api: [
        { name: 'nonce', type: 'string', description: 'Nonce applied to inline style and script tags created by Base UI.' },
        { name: 'disableStyleElements', type: 'boolean', defaultValue: 'false', description: 'Prevents Base UI from creating inline style elements.' },
        { name: 'children', type: 'ReactNode', description: 'Application subtree receiving the CSP configuration.' },
      ],
      interactions: ['Wrap the app near the root.', 'Use when a strict CSP blocks inline styles.', 'Pass the server-generated nonce for each request.'],
    },
    {
      id: 'directionprovider', title: 'Direction Provider', group: 'Feedback', summary: 'A provider that enables RTL or LTR behavior across Base UI components.', icon: AlignJustify,
      preview: <DirectionProvider direction="rtl"><div className="action-row"><Button variant="outline">RTL</Button><Select id="rtl-density" items={densityItems} defaultValue="compact" /></div></DirectionProvider>,
      code: `import { DirectionProvider } from './components/ui'

<DirectionProvider direction="rtl">
  <App />
</DirectionProvider>`,
      api: [
        { name: 'direction', type: `'ltr' | 'rtl'`, defaultValue: `'ltr'`, description: 'Reading direction applied to Base UI components.' },
        { name: 'children', type: 'ReactNode', description: 'Application subtree receiving direction context.' },
        { name: 'useDirection', type: '() => TextDirection', description: 'Hook exported for reading the active direction.' },
      ],
      interactions: ['Wrap localized RTL surfaces.', 'Menus, popovers, and keyboard behavior read direction context.', 'Use the hook inside custom wrappers when needed.'],
    },
    {
      id: 'accordion', title: 'Accordion', group: 'Disclosure', summary: 'Stacked disclosure panels for related sections of content.', icon: Waypoints,
      preview: <Accordion items={accordionItems} defaultValue={['a11y']} />,
      code: `import { Accordion } from './components/ui'

<Accordion
  items={[
    { value: 'a11y', label: 'Accessibility', content: '...' },
    { value: 'styling', label: 'Styling', content: '...' },
  ]}
  defaultValue={['a11y']}
/>`,
      api: [
        { name: 'items', type: 'AccordionItem[]', description: 'Panels with value, label, and content.' },
        { name: 'defaultValue', type: 'string[]', description: 'Panels open on first render.' },
        { name: 'collapsible', type: 'boolean', description: 'Allows all panels to be closed when enabled by Base UI props.' },
      ],
      interactions: ['Click a header to expand or collapse.', 'Use arrow keys between triggers.', 'Panel height is controlled by Base UI state attributes.'],
    },
    {
      id: 'collapsible', title: 'Collapsible', group: 'Disclosure', summary: 'A single expandable region for optional detail.', icon: ChevronDown,
      preview: <Collapsible label={t.extended.moreDetails}><p>{t.extended.collapsibleContent}</p></Collapsible>,
      code: `import { Collapsible } from './components/ui'

<Collapsible label="More details">
  <p>Collapsible panels support expanding/collapsing any content.</p>
</Collapsible>`,
      api: [
        { name: 'label', type: 'string', description: 'Trigger text.' },
        { name: 'defaultOpen', type: 'boolean', defaultValue: 'false', description: 'Initial open state.' },
        { name: 'children', type: 'ReactNode', description: 'Content revealed inside the panel.' },
      ],
      interactions: ['Click the trigger to expand.', 'Click again to collapse.', 'Content remains accessible through Base UI state.'],
    },
    {
      id: 'dialog', title: 'Dialog', group: 'Disclosure', summary: 'A modal layer with focus management and dismiss behavior.', icon: Copy,
      preview: <Dialog trigger={<Button variant="outline">{t.preview.dialog}</Button>} title={t.preview.dialogTitle} description={t.preview.dialogDesc}><Button variant="teal">{t.confirm}</Button></Dialog>,
      code: `import { Dialog } from './components/ui'

<Dialog
  trigger={<Button variant="outline">Open</Button>}
  title="Base UI Dialog"
  description="Accessible dialog with focus management."
>
  <Button variant="teal">Confirm</Button>
</Dialog>`,
      api: [
        { name: 'trigger', type: 'ReactElement', description: 'Element rendered as Dialog.Trigger.' },
        { name: 'title', type: 'string', description: 'Accessible dialog title.' },
        { name: 'description', type: 'string', description: 'Supporting copy announced to assistive tech.' },
      ],
      interactions: ['Click trigger to open.', 'Escape or close button dismisses.', 'Focus is trapped while open.'],
    },
    {
      id: 'alertdialog', title: 'Alert Dialog', group: 'Disclosure', summary: 'A confirmation modal for actions that need explicit acknowledgement.', icon: Bell,
      preview: <AlertDialog trigger={<Button variant="accent">{t.extended.delete}</Button>} title={t.extended.deleteTitle} description={t.extended.deleteDesc} confirmLabel={t.extended.delete} />,
      code: `import { AlertDialog } from './components/ui'

<AlertDialog
  trigger={<Button variant="accent">Delete</Button>}
  title="Delete item"
  description="This action cannot be undone."
  confirmLabel="Delete"
/>`,
      api: [
        { name: 'trigger', type: 'ReactElement', description: 'Action that opens the alert dialog.' },
        { name: 'confirmLabel', type: 'string', description: 'Label for the primary confirmation action.' },
        { name: 'cancelLabel', type: 'string', defaultValue: `'Cancel'`, description: 'Label for the cancel action.' },
      ],
      interactions: ['Opens as a modal confirmation.', 'Cancel returns focus to trigger.', 'Confirm closes after activation.'],
    },
    {
      id: 'drawer', title: 'Drawer', group: 'Disclosure', summary: 'A side panel for settings and secondary workflows.', icon: PanelRight,
      preview: <Drawer trigger={<Button variant="outline"><PanelRight size={15} />{t.extended.openDrawer}</Button>} title={t.extended.settingsPanel} description={t.extended.settingsDesc}><div className="control-stack"><Select id="drw-theme" items={{ light: 'Light', dark: 'Dark' }} defaultValue="light" label={t.extended.theme} /><Checkbox id="drw-compact" defaultChecked label={t.extended.compactMode} /></div></Drawer>,
      code: `import { Drawer } from './components/ui'

<Drawer
  trigger={<Button variant="outline">Open Drawer</Button>}
  title="Settings Panel"
  description="Configure appearance and behavior."
>
  <Select id="theme" items={{ light: 'Light', dark: 'Dark' }} />
</Drawer>`,
      api: [
        { name: 'trigger', type: 'ReactElement', description: 'Element used to open the drawer.' },
        { name: 'title', type: 'string', description: 'Drawer heading.' },
        { name: 'children', type: 'ReactNode', description: 'Interactive drawer body content.' },
      ],
      interactions: ['Slides in from the side.', 'Backdrop click and Escape close it.', 'Nested controls remain keyboard reachable.'],
    },
    {
      id: 'popover', title: 'Popover', group: 'Disclosure', summary: 'A lightweight positioned layer for contextual content.', icon: Image,
      preview: <Popover trigger={<Button variant="outline"><Eye size={15} />{t.preview.popover}</Button>} title={t.preview.popoverTitle} description={t.preview.popoverDesc} />,
      code: `import { Popover } from './components/ui'

<Popover
  trigger={<Button variant="outline">Open</Button>}
  title="Token preview"
  description="Card radius, borders, and shadows in CSS variables."
/>`,
      api: [
        { name: 'trigger', type: 'ReactElement', description: 'Element that anchors the popover.' },
        { name: 'title', type: 'string', description: 'Optional content heading.' },
        { name: 'children', type: 'ReactNode', description: 'Custom body content.' },
      ],
      interactions: ['Click trigger to open.', 'Click outside or Escape to close.', 'Positioner keeps content aligned to trigger.'],
    },
    {
      id: 'previewcard', title: 'Preview Card', group: 'Disclosure', summary: 'A hover or focus preview surface for linked resources.', icon: Eye,
      preview: <PreviewCard trigger={<Button variant="outline"><Image size={15} />{t.extended.preview2}</Button>} title={t.extended.previewCardTitle} description={t.extended.previewCardDesc} />,
      code: `import { PreviewCard } from './components/ui'

<PreviewCard
  trigger={<Button variant="outline">Preview</Button>}
  title="Bento Card Design"
  description="Bento Grid layout with design token system."
/>`,
      api: [
        { name: 'trigger', type: 'ReactElement', description: 'Anchor element for the preview.' },
        { name: 'title', type: 'string', description: 'Preview heading.' },
        { name: 'description', type: 'string', description: 'Preview supporting text.' },
      ],
      interactions: ['Hover or focus the trigger.', 'Preview appears near the trigger.', 'Moving away dismisses it.'],
    },
    {
      id: 'tooltip', title: 'Tooltip', group: 'Disclosure', summary: 'A small non-interactive label for controls and dense interfaces.', icon: Sparkles,
      preview: <Tooltip content={t.preview.tooltipContent}><Button variant="outline"><Sparkles size={15} />Hover me</Button></Tooltip>,
      code: `import { Tooltip } from './components/ui'

<Tooltip content="Tooltip primitive">
  <Button variant="outline">Hover me</Button>
</Tooltip>`,
      api: [
        { name: 'content', type: 'ReactNode', description: 'Tooltip body.' },
        { name: 'children', type: 'ReactElement', description: 'Trigger element.' },
        { name: 'className', type: 'string', description: 'Optional popup class.' },
      ],
      interactions: ['Hover or focus the trigger.', 'Tooltip follows Base UI delay behavior.', 'Escape dismisses the visible tooltip.'],
    },
    {
      id: 'tabs', title: 'Tabs', group: 'Navigation', summary: 'A tablist for switching between related panels without navigating away.', icon: Layers3,
      preview: <Tabs panels={tabPanels} defaultValue="usage" />,
      code: `import { Tabs } from './components/ui'

<Tabs
  panels={[
    { value: 'usage', label: 'Usage', title: 'Composable parts', content: '...' },
    { value: 'states', label: 'States', title: 'Data attributes', content: '...' },
  ]}
  defaultValue="usage"
/>`,
      api: [
        { name: 'panels', type: 'TabPanel[]', description: 'Tab labels and panel contents.' },
        { name: 'defaultValue', type: 'string', description: 'Initial active tab.' },
        { name: 'orientation', type: `'horizontal' | 'vertical'`, defaultValue: `'horizontal'`, description: 'Passed through to Base UI Tabs.' },
      ],
      interactions: ['Click tabs to switch panels.', 'Use arrow keys across the tablist.', 'Selected state is exposed through data attributes.'],
    },
    {
      id: 'menu', title: 'Menu', group: 'Navigation', summary: 'A command menu for grouped actions and disabled items.', icon: AlignJustify,
      preview: <Menu trigger={<Button variant="outline"><AlignJustify size={15} />{t.extended.actions}</Button>} items={menuItems} />,
      code: `import { Menu } from './components/ui'

<Menu
  trigger={<Button variant="outline">Actions</Button>}
  items={[
    { label: 'Edit', icon: <Type size={15} /> },
    'separator',
    { label: 'Delete', icon: <Code2 size={15} />, disabled: true },
  ]}
/>`,
      api: [
        { name: 'trigger', type: 'ReactElement', description: 'Element that opens the menu.' },
        { name: 'items', type: '(MenuItemData | "separator")[]', description: 'Action items and separators.' },
        { name: 'disabled', type: 'boolean', description: 'Per-item flag that blocks activation.' },
      ],
      interactions: ['Open with pointer or keyboard.', 'Arrow keys move active item.', 'Disabled items stay visible but cannot activate.'],
    },
    {
      id: 'contextmenu', title: 'Context Menu', group: 'Navigation', summary: 'A menu opened from a contextual right-click or keyboard context action.', icon: AlignJustify,
      preview: <ContextMenu items={menuItems}><span>Right click this surface</span></ContextMenu>,
      code: `import { ContextMenu } from './components/ui'

<ContextMenu
  items={[
    { label: 'Edit' },
    'separator',
    { label: 'Delete', disabled: true },
  ]}
>
  <span>Right click this surface</span>
</ContextMenu>`,
      api: [
        { name: 'children', type: 'ReactNode', description: 'Surface that receives the context menu trigger.' },
        { name: 'items', type: '(ContextMenuItemData | "separator")[]', description: 'Context actions rendered in the popup.' },
        { name: 'disabled', type: 'boolean', description: 'Per-item disabled state.' },
      ],
      interactions: ['Right-click the trigger surface.', 'Use keyboard context menu key where available.', 'Click outside to dismiss.'],
    },
    {
      id: 'menubar', title: 'Menubar', group: 'Navigation', summary: 'A horizontal application menu composed from Base UI menubar and menu primitives.', icon: Navigation,
      preview: <Menubar menus={[{ label: 'File', items: [{ label: 'New' }, { label: 'Duplicate' }, { label: 'Archive' }] }, { label: 'Edit', items: [{ label: 'Undo' }, { label: 'Redo', disabled: true }] }]} />,
      code: `import { Menubar } from './components/ui'

<Menubar
  menus={[
    { label: 'File', items: [{ label: 'New' }, { label: 'Duplicate' }] },
    { label: 'Edit', items: [{ label: 'Undo' }, { label: 'Redo', disabled: true }] },
  ]}
/>`,
      api: [
        { name: 'menus', type: 'MenubarMenu[]', description: 'Top-level menus and nested menu items.' },
        { name: 'orientation', type: `'horizontal' | 'vertical'`, defaultValue: `'horizontal'`, description: 'Direction inherited by the underlying menubar.' },
        { name: 'loopFocus', type: 'boolean', defaultValue: 'true', description: 'Loops arrow-key focus at edges.' },
      ],
      interactions: ['Open menus with pointer or keyboard.', 'Arrow keys move across menu triggers.', 'Submenu items use Base UI menu behavior.'],
    },
    {
      id: 'navmenu', title: 'Navigation Menu', group: 'Navigation', summary: 'A top-level navigation primitive with nested flyout items.', icon: Navigation,
      preview: <NavigationMenu items={navItems} />,
      code: `import { NavigationMenu } from './components/ui'

<NavigationMenu
  items={[
    { label: 'Components', href: '/components/button' },
    {
      label: 'Resources',
      children: [
        { label: 'Documentation', href: 'https://base-ui.com' },
      ],
    },
  ]}
/>`,
      api: [
        { name: 'items', type: 'NavMenuItem[]', description: 'Links and groups rendered in the navigation menu.' },
        { name: 'href', type: 'string', description: 'Destination for leaf menu items.' },
        { name: 'children', type: 'NavMenuItem[]', description: 'Nested flyout items.' },
      ],
      interactions: ['Hover or focus grouped items.', 'Nested links open in a positioned menu.', 'Keyboard users can move through menu items.'],
    },
    {
      id: 'progress', title: 'Progress', group: 'Feedback', summary: 'A linear indicator for completion percentage and loading workflows.', icon: Gauge,
      preview: <Progress value={68} showValue aria-label="Loading" />,
      code: `import { Progress } from './components/ui'

<Progress value={68} showValue aria-label="Loading" />`,
      api: [
        { name: 'value', type: 'number', description: 'Current progress value.' },
        { name: 'max', type: 'number', defaultValue: '100', description: 'Maximum value.' },
        { name: 'showValue', type: 'boolean', defaultValue: 'false', description: 'Displays the numeric percentage beside the bar.' },
      ],
      interactions: ['Update value from app state.', 'Use aria-label for screen readers.', 'Visual fill follows value changes.'],
    },
    {
      id: 'meter', title: 'Meter', group: 'Feedback', summary: 'A semantic gauge for bounded measurements like storage or quota usage.', icon: Gauge,
      preview: <Meter value={72} showValue aria-label={t.extended.storageUsage} />,
      code: `import { Meter } from './components/ui'

<Meter value={72} showValue aria-label="Storage usage" />`,
      api: [
        { name: 'value', type: 'number', description: 'Current measured value.' },
        { name: 'min / max', type: 'number', defaultValue: '0 / 100', description: 'Bounds for the measurement.' },
        { name: 'showValue', type: 'boolean', defaultValue: 'false', description: 'Shows the normalized percentage.' },
      ],
      interactions: ['Use for known bounded values.', 'Update value from live data.', 'Screen readers receive meter semantics.'],
    },
    {
      id: 'toast', title: 'Toast', group: 'Feedback', summary: 'A transient notification system with provider-managed state.', icon: Bell,
      preview: <ToastProvider><ToastDemoContent /></ToastProvider>,
      code: `import { ToastProvider, useToastManager } from './components/ui'

function App() {
  return (
    <ToastProvider>
      <YourApp />
    </ToastProvider>
  )
}

function YourApp() {
  const toast = useToastManager()
  return (
    <Button onClick={() => toast.add('Saved', 'Settings updated.')}>
      Show Toast
    </Button>
  )
}`,
      api: [
        { name: 'ToastProvider', type: '({ children }) => JSX.Element', description: 'Wraps the area that can create toasts.' },
        { name: 'useToastManager', type: '() => { add(title, description?) }', description: 'Hook for pushing toast notifications.' },
        { name: 'description', type: 'string', description: 'Optional supporting text in a toast.' },
      ],
      interactions: ['Click an action to enqueue a toast.', 'Multiple toasts stack in the viewport.', 'Toasts dismiss automatically after their timeout.'],
    },
    {
      id: 'scrollarea', title: 'Scroll Area', group: 'Feedback', summary: 'A custom scroll container with consistent scrollbar styling across the site.', icon: PanelRight,
      preview: <ScrollArea style={{ height: 140, width: 320 }}><p style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.7 }}>{t.extended.scrollContent}</p></ScrollArea>,
      code: `import { ScrollArea } from './components/ui'

<ScrollArea style={{ height: 140 }}>
  <p>Scrollable content here...</p>
</ScrollArea>`,
      api: [
        { name: 'children', type: 'ReactNode', description: 'Scrollable content rendered inside the viewport.' },
        { name: 'style', type: 'CSSProperties', description: 'Set stable height/width for the scroll container.' },
        { name: 'className', type: 'string', description: 'Optional root class for layout integration.' },
      ],
      interactions: ['Scroll with wheel, trackpad, or keyboard.', 'Scrollbar thumb uses the same tokens as the page scrollbar.', 'The corner element is styled for two-axis scrolling.'],
    },
    {
      id: 'avatar', title: 'Avatar', group: 'Feedback', summary: 'A compact identity primitive with fallback initials and grouped presentation.', icon: Users,
      preview: <div className="action-row"><Avatar fallback="JD" size="sm" /><Avatar fallback="AM" /><Avatar fallback="RK" size="lg" /><AvatarGroup><Avatar fallback="A" size="sm" /><Avatar fallback="B" size="sm" /><Avatar fallback="C" size="sm" /></AvatarGroup></div>,
      code: `import { Avatar, AvatarGroup } from './components/ui'

<Avatar fallback="JD" size="sm" />
<Avatar fallback="AM" />
<Avatar fallback="RK" size="lg" />
<AvatarGroup>
  <Avatar fallback="A" size="sm" />
  <Avatar fallback="B" size="sm" />
  <Avatar fallback="C" size="sm" />
</AvatarGroup>`,
      api: [
        { name: 'src', type: 'string', description: 'Optional image URL passed to Base UI Avatar.' },
        { name: 'fallback', type: 'string', description: 'Initials or short fallback label.' },
        { name: 'size', type: `'sm' | 'md' | 'lg'`, defaultValue: `'md'`, description: 'Controls avatar dimensions.' },
      ],
      interactions: ['Image load failure falls back to initials.', 'Groups overlap avatars with stable spacing.', 'Use meaningful fallback text for accessibility.'],
    },
  ]
}

function groupDocs(docs: ComponentDoc[]): SidebarGroup[] {
  return ['Inputs', 'Disclosure', 'Navigation', 'Feedback'].map((title) => ({
    title,
    items: docs.filter((doc) => doc.group === title),
  }))
}

function Sidebar({ docs, activeId }: { docs: ComponentDoc[]; activeId: string }) {
  const groups = groupDocs(docs)

  return (
    <aside className="sidebar">
      {groups.map((group) => (
        <div className="sidebar-group" key={group.title}>
          <div className="sidebar-group-title">{group.title}</div>
          {group.items.map((item) => {
            const Icon = item.icon
            const href = toComponentPath(item.id)
            return (
              <a
                key={item.id}
                className={`sidebar-link${activeId === item.id ? ' active' : ''}`}
                href={href}
                onClick={(event) => {
                  event.preventDefault()
                  navigateTo(href)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              >
                <Icon size={16} />
                {item.title}
              </a>
            )
          })}
        </div>
      ))}
    </aside>
  )
}

function Topbar({ activeId, page }: { activeId: string; page: string }) {
  const t = useT()
  const { setTheme, resolved, style, setStyle } = useTheme()
  const { locale, setLocale } = useLocale()
  const nextStyle = style === 'bento' ? 'shadcn' : style === 'shadcn' ? 'neo-brutalism' : 'bento'
  const styleLabel = style === 'neo-brutalism' ? 'Neo' : style === 'shadcn' ? 'Shadcn' : 'Bento'

  return (
    <header className="topbar">
      <a className="topbar-brand" href={toComponentPath('button')} onClick={(event) => { event.preventDefault(); navigateTo(toComponentPath('button')) }}>
        <span className="topbar-brand-mark"><Blocks size={16} /></span>
        Base Themes
      </a>
      <nav className="topbar-nav">
        <a href={toComponentPath(activeId)} className={page === 'components' ? 'active' : ''} onClick={(event) => { event.preventDefault(); navigateTo(toComponentPath(activeId)) }}>{t.nav.components}</a>
        <a href="/blocks" className={page === 'blocks' ? 'active' : ''} onClick={(event) => { event.preventDefault(); navigateTo('/blocks') }}>Blocks</a>
        <a href="/themes" className={page === 'themes' ? 'active' : ''} onClick={(event) => { event.preventDefault(); navigateTo('/themes') }}>Themes</a>
        <a href="/docs/installation" className={page === 'installation' ? 'active' : ''} onClick={(event) => { event.preventDefault(); navigateTo('/docs/installation') }}>Installation</a>
      </nav>
      <div className="topbar-spacer" />
      <div className="topbar-actions">
        <button type="button" className="topbar-icon-btn" onClick={() => setLocale(locale === 'en' ? 'zh' : 'en')}>
          <Languages size={15} />
          {locale === 'en' ? '中文' : 'EN'}
        </button>
        <button type="button" className="topbar-icon-btn" onClick={() => setStyle(nextStyle)}>
          <Sparkles size={15} />
          {styleLabel}
        </button>
        <button type="button" className="topbar-ghost-btn" onClick={() => setTheme(resolved === 'light' ? 'dark' : 'light')} aria-label="Toggle theme">
          {resolved === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        <a className="topbar-ghost-btn" href="https://github.com/mui/base-ui" target="_blank" rel="noreferrer" aria-label="GitHub">
          <Code2 size={18} />
        </a>
      </div>
    </header>
  )
}

function BlocksPage() {
  return (
    <article className="component-page">
      <div className="page-hero component-hero">
        <div className="doc-kicker">Blocks</div>
        <h1>Application Blocks</h1>
        <p>Composable page sections built from the same Base Themes primitives, modeled after shadcn/ui blocks.</p>
      </div>
      <div className="blocks-grid">
        <section className="block-preview">
          <div className="block-preview-header">
            <span>Dashboard Shell</span>
            <Button variant="outline">Preview</Button>
          </div>
          <div className="block-dashboard">
            <div className="block-stat"><strong>24</strong><span>Components</span></div>
            <div className="block-stat"><strong>100%</strong><span>Typed</span></div>
            <Progress value={72} showValue aria-label="Coverage" />
          </div>
          <ComponentDemo title="Block Code" preview={<span className="muted">Reusable operational dashboard section</span>} code={`import { Button, Progress } from './components/ui'

export function DashboardBlock() {
  return (
    <section className="dashboard-block">
      <Button variant="outline">Preview</Button>
      <Progress value={72} showValue aria-label="Coverage" />
    </section>
  )
}`} />
        </section>
        <section className="block-preview">
          <div className="block-preview-header">
            <span>Settings Form</span>
            <Button variant="teal">Save</Button>
          </div>
          <Fieldset legend="Workspace">
            <Field label="Name"><input className="bento-input" defaultValue="Base Themes" /></Field>
            <Switch id="block-switch" defaultChecked label="Public docs" />
          </Fieldset>
        </section>
      </div>
    </article>
  )
}

function ThemesPage() {
  const swatches = ['--bg', '--surface', '--text-strong', '--accent', '--teal', '--blue', '--green']
  const { style, setStyle } = useTheme()

  return (
    <article className="component-page">
      <div className="page-hero component-hero">
        <div className="doc-kicker">Themes</div>
        <h1>Custom Theme</h1>
        <p>Theme tokens are centralized CSS variables. Use Bento as the default style, shadcn for neutral product UI, or neo brutalism for high-contrast chunky interfaces.</p>
      </div>
      <div className="style-switcher" aria-label="Theme style">
        <button className={style === 'bento' ? 'active' : ''} type="button" onClick={() => setStyle('bento')}>Bento</button>
        <button className={style === 'shadcn' ? 'active' : ''} type="button" onClick={() => setStyle('shadcn')}>Shadcn</button>
        <button className={style === 'neo-brutalism' ? 'active' : ''} type="button" onClick={() => setStyle('neo-brutalism')}>Neo Brutalism</button>
      </div>
      <div className="theme-grid">
        {swatches.map((token) => <div className="theme-swatch" key={token}><span style={{ background: `var(${token})` }} /> <code>{token}</code></div>)}
      </div>
      <ComponentDemo
        title="Theme Override"
        preview={<div className="theme-sample"><Button variant="accent">Accent</Button><Button variant="teal">Teal</Button><Input label="Tokenized input" placeholder="Theme aware" /></div>}
        code={`/* src/styles/tokens.css */
:root {
  --bg: #f8fafc;
  --surface: #ffffff;
  --text-strong: #111827;
  --accent: #f97316;
  --teal: #0f766e;
}

[data-style='shadcn'] {
  --bg: #ffffff;
  --surface: #ffffff;
  --text-strong: #09090b;
  --accent: #18181b;
}

[data-style='shadcn'][data-theme='dark'] {
  --bg: #0b1120;
  --surface: #09090b;
  --text-strong: #fafafa;
  --accent: #fafafa;
}

[data-style='neo-brutalism'] {
  --bg: #fff7d6;
  --surface: #ffffff;
  --text-strong: #000000;
  --accent: #ff4d6d;
  --teal: #00d1b2;
}`} />
    </article>
  )
}

function InstallationPage() {
  return (
    <article className="component-page">
      <div className="page-hero component-hero">
        <div className="doc-kicker">Installation</div>
        <h1>Install Base Themes</h1>
        <p>Copy the wrappers into your app, install Base UI and icons, then import the token and component styles.</p>
      </div>
      <ComponentDemo
        title="Create a React project"
        preview={<span className="muted">Works with Vite, Next.js, Remix, or any React app.</span>}
        code={`npm create vite@latest my-app -- --template react-ts
cd my-app
npm install @base-ui/react lucide-react clsx`} />
      <ComponentDemo
        title="Copy components"
        preview={<span className="muted">Copy only the primitives you need, or copy the full ui folder.</span>}
        code={`cp -R src/components/ui ./my-app/src/components/ui
cp -R src/styles ./my-app/src/styles

/* main CSS */
@import './styles/tokens.css';`} />
      <ComponentDemo
        title="Use a component"
        preview={<Button>Installed</Button>}
        code={`import { Button } from './components/ui'

export function App() {
  return <Button>Installed</Button>
}`} />
    </article>
  )
}

function ApiTable({ rows }: { rows: ApiProp[] }) {
  return (
    <div className="api-table-wrap">
      <table className="api-table">
        <thead>
          <tr>
            <th>Prop</th>
            <th>Type</th>
            <th>Default</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <td><code>{row.name}</code></td>
              <td><code>{row.type}</code></td>
              <td>{row.defaultValue ? <code>{row.defaultValue}</code> : <span className="muted">-</span>}</td>
              <td>{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ComponentPage({ doc }: { doc: ComponentDoc }) {
  return (
    <article className="component-page">
      <div className="page-hero component-hero">
        <div className="doc-kicker">Components</div>
        <h1>{doc.title}</h1>
        <p>{doc.summary}</p>
      </div>

      <section className="doc-section">
        <div className="section-heading">
          <h2>Preview</h2>
          <p>Interactive example using the local Base UI wrapper and selected visual layer.</p>
        </div>
        <ComponentDemo title="Interactive Demo" preview={doc.preview} code={doc.code} />
      </section>

      <section className="doc-section">
        <div className="section-heading">
          <h2>API Reference</h2>
          <p>Primary props exposed by this wrapper. Base UI root props are still passed through where the component supports them.</p>
        </div>
        <ApiTable rows={doc.api} />
      </section>

      <section className="doc-section">
        <div className="section-heading">
          <h2>Interactions</h2>
          <p>Behavior to verify when embedding this component in product screens.</p>
        </div>
        <ul className="interaction-list">
          {doc.interactions.map((interaction) => <li key={interaction}>{interaction}</li>)}
        </ul>
      </section>
    </article>
  )
}

export default function App() {
  const docs = useComponentDocs()
  const pathname = usePathname()
  const page = getPage(pathname)
  const firstId = docs[0]?.id ?? 'button'
  const activeId = getCurrentId(pathname, firstId)
  const doc = useMemo(() => docs.find((item) => item.id === activeId) ?? docs[0], [activeId, docs])

  return (
    <Tooltip.Provider>
      <Topbar activeId={doc.id} page={page} />
      {page === 'components' && <Sidebar docs={docs} activeId={doc.id} />}
      <main className={`main-content${page !== 'components' ? ' no-sidebar' : ''}`}>
        {page === 'blocks' && <BlocksPage />}
        {page === 'themes' && <ThemesPage />}
        {page === 'installation' && <InstallationPage />}
        {page === 'components' && <ComponentPage doc={doc} />}
      </main>
    </Tooltip.Provider>
  )
}

export { Accordion, AlertDialog, Autocomplete, Avatar, AvatarGroup, Button, Checkbox, CheckboxGroup, Collapsible, Combobox, ContextMenu, CspProvider, Dialog, DirectionProvider, Drawer, Field, Fieldset, Form, Input, Menu, Menubar, Meter, NavigationMenu, NumberField, OtpField, Popover, PreviewCard, Progress, Radio, RadioGroup, ScrollArea, Select, Separator, Slider, Switch, Tabs, ToastProvider, Toggle, ToggleGroup, Toolbar, Tooltip }
