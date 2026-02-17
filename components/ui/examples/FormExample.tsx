/** @format */

"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { FormProvider } from "react-hook-form";
import { FormInput, FormTextarea, FormSelect, Button, Card } from "../index";
import toast from "react-hot-toast";

const schema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  role: yup.string().required("Role is required"),
  message: yup.string().required("Message is required"),
});

type FormData = yup.InferType<typeof schema>;

export default function FormExample() {
  const methods = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      role: "",
      message: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Form submitted successfully!");
      methods.reset();
    } catch (error) {
      toast.error("Failed to submit form");
    }
  };

  const roleOptions = [
    { value: "", label: "Select a role", disabled: true },
    { value: "admin", label: "Admin" },
    { value: "user", label: "User" },
    { value: "guest", label: "Guest" },
  ];

  return (
    <Card title="Form Example" className="max-w-2xl mx-auto">
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
          <FormInput
            name="name"
            label="Name"
            placeholder="Enter your name"
            className="w-full"
          />

          <FormInput
            name="email"
            label="Email"
            type="email"
            placeholder="Enter your email"
            className="w-full"
          />

          <FormSelect
            name="role"
            label="Role"
            options={roleOptions}
            placeholder="Select a role"
            className="w-full"
          />

          <FormTextarea
            name="message"
            label="Message"
            placeholder="Enter your message"
            rows={5}
            className="w-full"
          />

          <div className="flex gap-2 justify-end mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => methods.reset()}
            >
              Reset
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={methods.formState.isSubmitting}
            >
              Submit
            </Button>
          </div>
        </form>
      </FormProvider>
    </Card>
  );
}

