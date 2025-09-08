import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-gray-50 to-gray-100 border-t border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-6 group">
              <div className="bg-gradient-to-r from-thera-600 to-thera-500 text-white p-2 rounded-lg shadow-md group-hover:shadow-lg transition-all">
                <span className="font-bold text-xl">T</span>
              </div>
              <span className="font-bold text-2xl text-thera-700 group-hover:text-thera-800 transition-colors">
                TheraLink
              </span>
            </Link>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              Connecting you with licensed therapists for a healthier mind and better tomorrow.
            </p>
            
            {/* Social Media Links */}
            <div className="flex space-x-4">
              {[
                { icon: Facebook, url: "https://www.facebook.com/profile.php?id=61559262162390 " },
                { icon: Twitter, url: "https://x.com/TherabotAi?t=tK4ML3BxCfzpvMkDWfwLHQ&s=09" },
                { icon: Instagram, url: "https://www.instagram.com/therabotai?igsh=d3Y5Z3o1aWJwd2h6 " },
                { icon: Linkedin, url: "https://www.linkedin.com/company/bricklabsai/ " }
                
              ].map((social, index) => (
                <a 
                  key={index}
                  href={social.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white p-2 rounded-full text-gray-500 hover:text-thera-600 hover:bg-thera-50 shadow-sm hover:shadow-md transition-all duration-300"
                  aria-label={`TheraLink on ${social.icon.name}`}
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          {[
            {
              title: "Platform",
              links: [
                { text: "Find Therapists", url: "/therapists" },
                { text: "AI Therapist Matching", url: "/ai-matching" },
                { text: "How It Works", url: "/how-it-works" }
              ]
            },
            {
              title: "Resources",
              links: [
                { text: "Mental Health Blog", url: "/blog" },
                { text: "Self-Help Resources", url: "/resources" },
                { text: "Crisis Support", url: "/crisis-support" }
              ]
            },
            {
              title: "Company",
              links: [
                { text: "About Us", url: "/about" },
                { text: "For Therapists", url: "/for-therapists" },
                { text: "Contact Us", url: "/contact" }
              ]
            }
          ].map((section, index) => (
            <div key={index}>
              <h3 className="text-gray-800 font-semibold text-lg mb-5 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-10 after:h-0.5 after:bg-thera-500">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link 
                      to={link.url} 
                      className="text-gray-600 text-sm hover:text-thera-600 transition-colors duration-200 hover:pl-1 inline-block"
                    >
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact information */}
        <div className="border-t border-gray-200 mt-12 pt-8 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <Mail size={18} className="text-thera-600 mr-2" />
              <a 
                href="mailto:support@theralink.com" 
                className="text-gray-700 hover:text-thera-600 transition-colors text-sm font-medium"
              >
                help@trytherabot.com
              </a>
            </div>
            <div className="text-gray-600 text-sm bg-white px-4 py-2 rounded-lg shadow-sm">
              <span className="hidden sm:inline">📍</span>  KMA — upperhill
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 mt-6 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-500 text-sm">
              © {currentYear} TheraLink. All rights reserved.
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {[
                { text: "Terms of Service", url: "/terms" },
                { text: "Privacy Policy", url: "/privacy" },
                { text: "HIPAA Compliance", url: "/hipaa" }
              ].map((link, index) => (
                <Link 
                  key={index}
                  to={link.url} 
                  className="text-gray-500 text-sm hover:text-thera-600 transition-colors hover:underline underline-offset-4"
                >
                  {link.text}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;