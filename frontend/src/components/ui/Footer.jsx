import { MapPin, Mail, Phone } from 'lucide-react';
import logo from '../../assets/images/logo.png';

export default function Footer() {
  return (
    <footer className="bg-primary text-on-dark font-sans pt-8 pb-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">

          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="Bekal Opat Logo"
              className="h-24 w-auto object-contain shrink-0"
            />
            <div className="leading-none hidden">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">bekal</h2>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight -mt-1">opat</h2>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2 text-sm md:text-base font-medium">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 opacity-70" />
              <span>+62 895 3437 66050</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 opacity-70" />
              <span>bekalopat@gmail.com</span>
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-on-dark/20"></div>

        <div className="flex flex-col md:flex-row flex-wrap gap-x-8 gap-y-10">

          <div className="min-w-50 max-w-xs">
            <h3 className="text-lg font-bold mb-4 text-on-dark">About Us</h3>
            <p className="text-on-dark/80 text-xs leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi blandit diam non magna pulvinar malesuada.
            </p>
          </div>

          <div className="min-w-37.5 max-w-xs">
            <h3 className="text-lg font-bold mb-4 text-on-dark">Follow Us</h3>
            <ul className="flex flex-col gap-2 text-xs text-on-dark/80">
              {['Instagram', 'Facebook', 'Twitter/X', 'Twitch'].map((social) => (
                <li key={social}>
                  <a href="#" className="hover:text-on-dark transition-colors duration-300">
                    {social}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="w-full ml-auto md:w-64 lg:w-72 h-48 md:h-auto md:min-h-50 rounded-xl overflow-hidden border border-on-dark/10 relative group shrink-0">
            <div className="absolute inset-0 bg-on-dark/10 flex items-center justify-center">
               <div className="text-center p-4">
                 <MapPin className="w-8 h-8 text-on-dark/50 mx-auto mb-2" />
                 <span className="text-xs text-on-dark/60">Interactive Map</span>
               </div>
            </div>
          </div>

        </div>

        <div className="pt-6 border-t border-on-dark/10">
          <p className="text-xs font-semibold text-on-dark">
            @Bekal Opat All Rights Reserved
          </p>
        </div>

      </div>
    </footer>
  );
}