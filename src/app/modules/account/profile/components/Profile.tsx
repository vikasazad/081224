"use client";

import { useForm } from "react-hook-form";
import { Globe, Mail, MapPin, Phone, User } from "lucide-react";
import { toast } from "sonner";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countriesList } from "@/lib/data/countriesData";

export default function Profile({ data }: { data: any }) {
  // Create grouped countries with labels and codes
  // console.log(data);
  const groupedCountries = useMemo(() => {
    return countriesList.reduce((acc: { [key: string]: string[] }, country) => {
      if (!acc[country.phone]) {
        acc[country.phone] = [];
      }
      acc[country.phone].push(country.label);
      return acc;
    }, {});
  }, []);

  // Find default country code from country name
  const getDefaultCountryCode = useMemo(() => {
    const country = countriesList.find((c) => c.label === data?.country);
    return country ? country.phone : "";
  }, [data?.country]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      fullName: data?.ownerName || "",
      country: data?.country || "",
      zipCode: data?.zipCode || "",
      countryCode:
        data?.contactInfo?.countryCode?.replace("+", "") ||
        getDefaultCountryCode,
      phoneNumber: data?.contactInfo?.phoneNumber || "",
      email: data?.contactInfo?.email || "",
      address: data?.address || "",
      website: "https://www.example.com",
    },
  });

  // Handle form submission
  const onSubmit = (formData: any) => {
    const formattedData = {
      ...formData,
      countryCode: `+${formData.countryCode}`,
    };
    console.log("Form Data:", formattedData);
    toast.success("Profile information updated successfully!");
  };

  // Custom handlers for Select components
  const handleCountryChange = (value: string) => {
    setValue("country", value);
    // Update country code when country changes
    const country = countriesList.find((c) => c.label === value);
    if (country) {
      setValue("countryCode", country.phone);
    }
  };

  const handleCountryCodeChange = (value: string) => {
    setValue("countryCode", value);
  };

  // Watch country and countryCode for controlled Select components
  const selectedCountry = watch("country");
  const selectedCountryCode = watch("countryCode");

  return (
    <Card className="max-w-4xl mx-8">
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            Personal Information
          </CardTitle>
          <CardDescription>
            Please review and update your personal and contact details below.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Basic Details
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  {...register("fullName", {
                    required: "Full name is required",
                    minLength: {
                      value: 2,
                      message: "Name must be at least 2 characters",
                    },
                  })}
                />
                {errors.fullName && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.fullName.message as string}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select
                  value={selectedCountry}
                  onValueChange={handleCountryChange}
                >
                  <SelectTrigger id="country">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countriesList.map((country) => (
                      <SelectItem key={country.code} value={country.label}>
                        {country.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.country && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.country.message as string}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  placeholder="Enter ZIP code"
                  {...register("zipCode", {
                    required: "ZIP code is required",
                    pattern: {
                      value: /^\d{5}(-\d{4})?$/,
                      message: "Please enter a valid ZIP code",
                    },
                  })}
                />
                {errors.zipCode && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.zipCode.message as string}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              Contact Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex gap-2">
                  <Select
                    value={selectedCountryCode}
                    onValueChange={handleCountryCodeChange}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Code" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(groupedCountries).map((code) => (
                        <SelectItem key={code} value={code}>
                          +{code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="phoneNumber"
                    placeholder="Enter phone number"
                    className="flex-1"
                    {...register("phoneNumber", {
                      required: "Phone number is required",
                      pattern: {
                        value: /^\d{10}$/,
                        message: "Please enter a valid 10-digit phone number",
                      },
                    })}
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.phoneNumber.message as string}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    placeholder="Enter email address"
                    className="pl-9"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Please enter a valid email address",
                      },
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.email.message as string}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Address & Website
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  placeholder="Enter your street address"
                  {...register("address", {
                    required: "Street address is required",
                    minLength: {
                      value: 5,
                      message: "Address must be at least 5 characters",
                    },
                  })}
                />
                {errors.address && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.address.message as string}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website URL</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="website"
                    placeholder="Enter website URL"
                    className="pl-9"
                    {...register("website", {
                      required: "Website URL is required",
                      pattern: {
                        value:
                          /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
                        message: "Please enter a valid URL",
                      },
                    })}
                  />
                </div>
                {errors.website && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.website.message as string}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" size="lg" className="ml-auto">
            Update Information
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
