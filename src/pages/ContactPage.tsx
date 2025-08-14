import { useState } from 'react';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { MoveRight, Send, Loader2, PhoneCall, Mail, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  subject: z.string().min(5, { message: "Subject must be at least 5 characters." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

const ContactPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: user?.email || "",
      subject: "",
      message: "",
    },
  });

const onSubmit = async (values: z.infer<typeof formSchema>) => {
  setIsSubmitting(true);

  try {
    const token = await supabase.auth.getSession()
      .then(({ data }) => data.session?.access_token);

    const response = await fetch(
      "https://oavljdrqfzliikfncrdd.supabase.co/functions/v1/contact_message",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          subject: values.subject,
          message: values.message,
          userId: user?.id || null
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to send message");
    }

    form.reset();
    toast({
      title: "Message Sent",
      description: "Thank you for contacting us! We'll get back to you as soon as possible.",
    });
  } catch (error) {
    console.error("Error submitting contact form:", error);
    toast({
      title: "Error",
      description: error instanceof Error ? error.message : "There was a problem sending your message. Please try again.",
      variant: "destructive",
    });
  } finally {
    setIsSubmitting(false);
  }
};


  return (
    <div className="container mx-auto py-12 px-4 sm:px-6">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-2">
          Contact Us
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Have questions about our services? Need help finding the right therapist? 
          We're here to assist you on your mental health journey.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <div>
          <Card className="border-0 shadow-md h-full">
            <CardHeader>
              <CardTitle>Get in Touch</CardTitle>
              <CardDescription>
                Fill out the form and our team will get back to you within 24 hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="How can we help you?" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Please describe your question or concern..." 
                            className="min-h-[120px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit"
                    className="w-full bg-thera-600 hover:bg-thera-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col">
          <Card className="border-0 shadow-md flex-1">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Here's how you can reach us directly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-thera-50 p-3 rounded-full">
                  <PhoneCall className="h-6 w-6 text-thera-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Phone</p>
                  <p className="text-gray-600">+254708419386</p>
                  <p className="text-sm text-gray-500">Mon-Fri from 8am to 5pm</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-thera-50 p-3 rounded-full">
                  <Mail className="h-6 w-6 text-thera-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Email</p>
                  <p className="text-gray-600">support@bricklabsai.org</p>
                  <p className="text-sm text-gray-500">We'll respond as soon as possible</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-thera-50 p-3 rounded-full">
                  <MapPin className="h-6 w-6 text-thera-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-700">Office</p>
                  <p className="text-gray-600">123 Therapy Lane</p>
                  <p className="text-gray-600">UpperHill</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md mt-6 bg-thera-50">
            <CardHeader>
              <CardTitle>Crisis Support</CardTitle>
              <CardDescription>
                If you're experiencing a mental health emergency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                If you or someone you know is in immediate danger, please call emergency services at <span className="font-bold">911</span> or go to your nearest emergency room.
              </p>
              <Button variant="secondary" className="w-full">
                View Crisis Resources
                <MoveRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-16">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-center">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">How quickly can I connect with a therapist?</h3>
                <p className="text-gray-600">Most clients can connect with a therapist within 24-48 hours of signing up and matching.</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">What types of therapy do you offer?</h3>
                <p className="text-gray-600">We provide various therapy approaches including CBT, mindfulness, psychodynamic, and more, delivered by certified professionals.</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">How much do sessions cost?</h3>
                <p className="text-gray-600">Session costs vary by therapist, experience level, and session type. Pricing information is available on each therapist's profile.</p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Are your therapists licensed?</h3>
                <p className="text-gray-600">Yes, all therapists on our platform are licensed and credentialed professionals with verified qualifications.</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="link" className="text-thera-600">
              View all FAQs
              <MoveRight className="ml-1 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ContactPage;
