# UI Components

Koleksi komponen UI yang siap digunakan dengan integrasi:
- **DaisyUI** untuk styling
- **react-hook-form** + **yup** untuk form validation
- **react-hot-toast** untuk notifications
- **AOS** untuk animations

## Komponen Dasar

### Button
```tsx
import { Button } from "@/components/ui";

<Button variant="primary" size="md" loading={false}>
  Click Me
</Button>
```

Props:
- `variant`: "primary" | "secondary" | "accent" | "ghost" | "outline" | "link"
- `size`: "xs" | "sm" | "md" | "lg"
- `loading`: boolean
- `fullWidth`: boolean

### Input
```tsx
import { Input } from "@/components/ui";

<Input
  label="Email"
  type="email"
  placeholder="Enter your email"
  error="This field is required"
  helperText="We'll never share your email"
/>
```

### Textarea
```tsx
import { Textarea } from "@/components/ui";

<Textarea
  label="Message"
  rows={5}
  placeholder="Enter your message"
/>
```

### Select
```tsx
import { Select, type SelectOption } from "@/components/ui";

const options: SelectOption[] = [
  { value: "1", label: "Option 1" },
  { value: "2", label: "Option 2" },
];

<Select
  label="Choose an option"
  options={options}
  placeholder="Select..."
/>
```

### Card
```tsx
import { Card } from "@/components/ui";

<Card
  title="Card Title"
  subtitle="Card subtitle"
  actions={<Button>Action</Button>}
>
  Card content here
</Card>
```

### Modal
```tsx
import { Modal } from "@/components/ui";

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal Title"
  size="md"
>
  Modal content
</Modal>
```

## Form Components (react-hook-form + yup)

### Setup Form
```tsx
"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { FormProvider } from "react-hook-form";
import { FormInput, FormTextarea, FormSelect, Button } from "@/components/ui";

const schema = yup.object({
  email: yup.string().email().required(),
  name: yup.string().required(),
  message: yup.string().required(),
});

export default function MyForm() {
  const methods = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: any) => {
    console.log(data);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <FormInput name="email" label="Email" type="email" />
        <FormInput name="name" label="Name" />
        <FormTextarea name="message" label="Message" />
        <Button type="submit">Submit</Button>
      </form>
    </FormProvider>
  );
}
```

## Toast Notifications

Toast sudah di-setup di layout. Gunakan di mana saja:

```tsx
import toast from "react-hot-toast";

// Success
toast.success("Operation successful!");

// Error
toast.error("Something went wrong!");

// Loading
const toastId = toast.loading("Processing...");
// Later...
toast.success("Done!", { id: toastId });

// Custom
toast("Custom message", {
  icon: "👏",
  duration: 4000,
});
```

## Animations (AOS)

```tsx
import { Animated } from "@/components/ui";

<Animated animation="fade-up" duration={1000} delay={100}>
  <div>This will animate on scroll</div>
</Animated>
```

Available animations:
- fade, fade-up, fade-down, fade-left, fade-right
- zoom-in, zoom-out
- slide-up, slide-down, slide-left, slide-right
- flip-up, flip-down, flip-left, flip-right

