
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Check,
  ArrowRight,
  Search,
  Calendar,
  MessageCircle,
  Video,
  Clock,
  Shield,
  Star,
  Heart
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const HowItWorks = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl animation-fade-in">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">How TheraLink Works</h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            A simple, secure way to connect with qualified therapists and receive the support you need from anywhere.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" className="group">
              <Link to="/therapists" className="flex items-center">
                Find Your Therapist
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/auth/register">Create Account</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Launch Video Section */}
      
<section className="mb-24 px-4">
  {/* Heading */}
  <div className="text-center mb-12">

    <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
      Watch our launch video to see how TheraLink makes mental health support
      accessible and seamless.
    </p>
  </div>

  {/* Video Container */}
  <div className="max-w-4xl mx-auto">
    <div className="relative w-full overflow-hidden rounded-3xl shadow-2xl border border-primary/20 group">
      {/* Hover effect glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none"></div>

      {/* Responsive video */}
      <div className="aspect-video">
        <iframe
          src="https://www.youtube.com/embed/xspT_J_b7Uo"
          title="TheraLink Launch Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full rounded-3xl"
        ></iframe>
      </div>
    </div>
  </div>
</section>


      
      {/* Step-by-Step Process */}
      <section className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Your Journey to Better Mental Health</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Follow these simple steps to start your therapy with TheraLink.
          </p>
        </div>
        
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Step 1 */}
          <div className="bg-card rounded-2xl p-8 card-shadow relative animation-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="absolute top-0 left-6 transform -translate-y-1/2 bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center font-medium text-lg">1</div>
            <div className="mb-6 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center">
              <Search className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Find Your Match</h3>
            <p className="text-muted-foreground mb-4">
              Browse our diverse network of licensed therapists, filtering by specialties, approaches, and availability to find your perfect match.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>Personalized therapist recommendations</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>Filter by specialty, experience, and more</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>Read verified client reviews</span>
              </li>
            </ul>
          </div>
          
          {/* Step 2 */}
          <div className="bg-card rounded-2xl p-8 card-shadow relative animation-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="absolute top-0 left-6 transform -translate-y-1/2 bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center font-medium text-lg">2</div>
            <div className="mb-6 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Book Your Session</h3>
            <p className="text-muted-foreground mb-4">
              Choose a convenient time from your therapist's availability calendar and schedule your first session in just a few clicks.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>Easy online scheduling</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>Flexible appointment times</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>Automatic calendar reminders</span>
              </li>
            </ul>
          </div>
          
          {/* Step 3 */}
          <div className="bg-card rounded-2xl p-8 card-shadow relative animation-fade-in" style={{ animationDelay: '0.5s' }}>
            <div className="absolute top-0 left-6 transform -translate-y-1/2 bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center font-medium text-lg">3</div>
            <div className="mb-6 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center">
              <Video className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Start Your Therapy</h3>
            <p className="text-muted-foreground mb-4">
              Connect with your therapist through secure video sessions or messaging, building a relationship that supports your mental health journey.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>High-quality video sessions</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>Secure messaging between sessions</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span>Access from any device</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
      
      {/* Types of Therapy */}
      <section className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Services We Offer</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our platform supports multiple therapy formats to fit your needs and preferences.
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2">
          <div className="bg-card rounded-2xl overflow-hidden card-shadow hover:shadow-elevation-3 transition-all duration-300">
            <div className="p-8">
              <div className="bg-primary/10 inline-flex p-3 rounded-full mb-6">
                <Video className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Video Therapy</h3>
              <p className="text-muted-foreground mb-4">
                Face-to-face sessions from the comfort of your home. Connect with your therapist through our secure video platform.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" /> 50-minute sessions
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" /> HIPAA compliant encryption
                </li>
                <li className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" /> Flexible scheduling
                </li>
              </ul>
            </div>
            <div className="border-t p-4 flex justify-between items-center">
              <span className="text-lg font-bold">$90-150 per session</span>
              <Button asChild size="sm">
                <Link to="/therapists">Find Video Therapist</Link>
              </Button>
            </div>
          </div>
          
          <div className="bg-card rounded-2xl overflow-hidden card-shadow hover:shadow-elevation-3 transition-all duration-300">
            <div className="p-8">
              <div className="bg-primary/10 inline-flex p-3 rounded-full mb-6">
                <MessageCircle className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Messaging Therapy</h3>
              <p className="text-muted-foreground mb-4">
                Communicate with your therapist through text-based messages at your own pace. Perfect for those who prefer writing.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" /> Unlimited messaging
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" /> End-to-end encryption
                </li>
                <li className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" /> Responses within 24-48 hours
                </li>
              </ul>
            </div>
            <div className="border-t p-4 flex justify-between items-center">
              <span className="text-lg font-bold">$60-90 per week</span>
              <Button asChild size="sm">
                <Link to="/therapists">Find Messaging Therapist</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Benefits Section */}
      <section className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose TheraLink?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our platform offers unique advantages that make therapy more accessible and effective.
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: <Shield className="h-10 w-10" />,
              title: "Secure & Private",
              description: "End-to-end encryption and HIPAA compliance ensure your information stays confidential."
            },
            {
              icon: <Star className="h-10 w-10" />,
              title: "Vetted Professionals",
              description: "All therapists are licensed, experienced, and undergo thorough background checks."
            },
            {
              icon: <Clock className="h-10 w-10" />,
              title: "Convenient Scheduling",
              description: "Book sessions that fit your schedule, with evening and weekend availability."
            },
            {
              icon: <Heart className="h-10 w-10" />,
              title: "Personalized Matching",
              description: "Our algorithm helps you find therapists who match your specific needs and preferences."
            },
            {
              icon: <Check className="h-10 w-10" />,
              title: "Affordable Options",
              description: "Various pricing tiers and insurance options make therapy financially accessible."
            },
            {
              icon: <MessageCircle className="h-10 w-10" />,
              title: "Continuous Support",
              description: "Stay connected with your therapist between sessions through secure messaging."
            }
          ].map((benefit, index) => (
            <div key={index} className="border rounded-xl p-6 hover:bg-accent/50 transition-colors">
              <div className="bg-primary/10 p-3 rounded-full inline-flex mb-4">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
              <p className="text-muted-foreground">{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about online therapy and TheraLink.
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Is online therapy as effective as in-person therapy?</AccordionTrigger>
              <AccordionContent>
                Yes, research shows that online therapy can be just as effective as in-person therapy for many mental health concerns. Multiple studies have demonstrated comparable outcomes for issues like depression, anxiety, and stress. The key is finding the right therapist and approach for your specific needs.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2">
              <AccordionTrigger>How much does therapy cost on TheraLink?</AccordionTrigger>
              <AccordionContent>
                Therapy costs vary based on the therapist's credentials, experience, and the type of service. Video sessions typically range from $90-150 per session, while messaging therapy plans start around $60-90 per week. Many of our therapists accept insurance, and we also offer sliding scale options for those with financial needs.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-3">
              <AccordionTrigger>How do I know if my therapist is qualified?</AccordionTrigger>
              <AccordionContent>
                All therapists on TheraLink are licensed mental health professionals who have been verified and vetted. We check their credentials, licenses, and insurance to ensure they meet our high standards. You can view their qualifications, specialties, and client reviews on their profiles.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-4">
              <AccordionTrigger>Is my information kept private?</AccordionTrigger>
              <AccordionContent>
                Absolutely. We take your privacy very seriously. TheraLink is HIPAA compliant and uses end-to-end encryption for all communications. Your personal information and therapy sessions are completely confidential and will never be shared without your explicit permission, except in cases where safety is at risk.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-5">
              <AccordionTrigger>Can I switch therapists if I'm not satisfied?</AccordionTrigger>
              <AccordionContent>
                Yes, you can change therapists at any time. We understand that finding the right therapeutic relationship is important, and sometimes it takes trying more than one therapist to find a good match. Our client success team can help facilitate this transition smoothly.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-6">
              <AccordionTrigger>Does TheraLink accept insurance?</AccordionTrigger>
              <AccordionContent>
                Many therapists on our platform accept insurance. During your search, you can filter for therapists who accept your specific insurance plan. For those using out-of-network benefits, we provide detailed receipts for reimbursement. We also offer superbills that you can submit to your insurance company.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="bg-gradient-to-br from-primary to-secondary rounded-3xl overflow-hidden card-shadow relative">
        <div className="relative z-10 p-12 text-white text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to start your journey?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Take the first step towards better mental health today. Our licensed therapists are ready to support you.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
              <Link to="/therapists">Find a Therapist</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-primary hover:bg-white/10">
              <Link to="/auth/register">Create an Account</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;
