/** @format */

"use client";

import { useState } from "react";
import {
  Button,
  Input,
  Textarea,
  Select,
  Card,
  Modal,
  Animated,
} from "../index";
import type { SelectOption } from "../types";
import toast from "react-hot-toast";

export default function UIComponentsExample() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<SelectOption | null>(null);

  const selectOptions: SelectOption[] = [
    { value: "1", label: "Option 1" },
    { value: "2", label: "Option 2" },
    { value: "3", label: "Option 3" },
  ];

  const handleToast = (type: "success" | "error" | "loading" | "custom") => {
    switch (type) {
      case "success":
        toast.success("Operation successful!");
        break;
      case "error":
        toast.error("Something went wrong!");
        break;
      case "loading":
        const toastId = toast.loading("Processing...");
        setTimeout(() => {
          toast.success("Done!", { id: toastId });
        }, 2000);
        break;
      case "custom":
        toast("Custom message", {
          icon: "👏",
          duration: 4000,
        });
        break;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <Animated animation="fade-up">
        <h1 className="text-4xl font-bold mb-8">UI Components Examples</h1>
      </Animated>

      {/* Buttons */}
      <Animated animation="fade-up" delay={100}>
        <Card title="Buttons" subtitle="Various button variants and sizes">
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="accent">Accent</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="link">Link</Button>
            <Button loading>Loading</Button>
          </div>
          <div className="flex flex-wrap gap-4 mt-4">
            <Button size="xs">Extra Small</Button>
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
        </Card>
      </Animated>

      {/* Inputs */}
      <Animated animation="fade-up" delay={200}>
        <Card title="Inputs" subtitle="Input fields with various features">
          <div className="space-y-4">
            <Input label="Basic Input" placeholder="Enter text" className="w-full" />
            <Input
              label="Input with Error"
              placeholder="Enter text"
              error="This field is required"
              className="w-full"
            />
            <Input
              label="Input with Helper Text"
              placeholder="Enter text"
              helperText="This is helper text"
              className="w-full"
            />
          </div>
        </Card>
      </Animated>

      {/* Textarea */}
      <Animated animation="fade-up" delay={300}>
        <Card title="Textarea" subtitle="Multi-line text input">
          <Textarea
            label="Message"
            placeholder="Enter your message"
            rows={5}
            className="w-full"
          />
        </Card>
      </Animated>

      {/* Select */}
      <Animated animation="fade-up" delay={400}>
        <Card title="Select" subtitle="Dropdown selection">
          <Select
            label="Choose an option"
            options={selectOptions}
            placeholder="Select an option"
            value={selectedValue}
            onChange={(selected) => {
              if (selected && !Array.isArray(selected)) {
                setSelectedValue(selected);
              } else {
                setSelectedValue(null);
              }
            }}
            className="w-full"
          />
        </Card>
      </Animated>

      {/* Modal */}
      <Animated animation="fade-up" delay={500}>
        <Card title="Modal" subtitle="Modal dialog component">
          <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Example Modal"
            size="md"
            actions={
              <>
                <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsModalOpen(false)}>Confirm</Button>
              </>
            }
          >
            <p>This is a modal dialog example. You can put any content here.</p>
          </Modal>
        </Card>
      </Animated>

      {/* Toast */}
      <Animated animation="fade-up" delay={600}>
        <Card title="Toast Notifications" subtitle="Toast notification examples">
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => handleToast("success")}>Success Toast</Button>
            <Button onClick={() => handleToast("error")}>Error Toast</Button>
            <Button onClick={() => handleToast("loading")}>Loading Toast</Button>
            <Button onClick={() => handleToast("custom")}>Custom Toast</Button>
          </div>
        </Card>
      </Animated>
    </div>
  );
}

