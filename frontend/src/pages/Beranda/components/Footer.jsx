import { MapPin, Mail, Phone } from 'lucide-react'; // Hapus GraduationCap jika tidak dipakai lagi
import logo from '../../../assets/images/logo.png';

export default function Footer() {
  return (
    <footer className="bg-primary text-light-1 font-sans pt-8 pb-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* === TOP SECTION: Logo & Contact === */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          
          {/* Logo Area - Menggunakan tag <img> */}
          <div className="flex items-center gap-3">
            <img 
              src={logo} 
              alt="Bekal Opat Logo" 
              className="h-24 w-auto object-contain shrink-0" 
              // h-12 = tinggi 48px, w-auto = lebar menyesuaikan rasio aspek gambar
            />
            {/* Opsional: Jika logo sudah mengandung teks "bekal opat", hapus div di bawah ini.
                Jika logo hanya ikon, biarkan teks ini. */}
            <div className="leading-none hidden"> 
              {/* Saya sembunyikan teks default karena biasanya logo PNG sudah include teks.
                  Hapus class "hidden" jika ingin tetap menampilkan teks di samping logo. */}
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">bekal</h2>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight -mt-1">opat</h2>
            </div>
          </div>

          {/* Contact Info */}
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

        {/* === DIVIDER === */}
        <div className="w-full h-px bg-light-1/20"></div>

        {/* === MAIN CONTENT === */}
        <div className="flex flex-col md:flex-row flex-wrap gap-x-8 gap-y-10">
          
          {/* Column 1-3: About Us */}
          <div className="min-w-[200px] max-w-xs">
            <h3 className="text-lg font-bold mb-4 text-light-1">About Us</h3>
            <p className="text-light-2 text-xs leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi blandit diam non magna pulvinar malesuada.
            </p>
          </div>

          {/* Column 4: Follow Us */}
          <div className="min-w-[150px] max-w-xs">
            <h3 className="text-lg font-bold mb-4 text-light-1">Follow Us</h3>
            <ul className="flex flex-col gap-2 text-xs text-light-2">
              {['Instagram', 'Facebook', 'Twitter/X', 'Twitch'].map((social) => (
                <li key={social}>
                  <a href="#" className="hover:text-light-1 transition-colors duration-300">
                    {social}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Map Placeholder */}
          <div className="w-full ml-auto md:w-64 lg:w-72 h-48 md:h-auto md:min-h-[200px] rounded-xl overflow-hidden border border-light-1/10 relative group shrink-0">
            <div className="absolute inset-0 bg-light-2/10 flex items-center justify-center">
               <div className="text-center p-4">
                 <MapPin className="w-8 h-8 text-light-1/50 mx-auto mb-2" />
                 <span className="text-xs text-light-2/50">Interactive Map</span>
               </div>
            </div>
          </div>

        </div>

        {/* === BOTTOM COPYRIGHT === */}
        <div className="pt-6 border-t border-light-1/10">
          <p className="text-xs font-semibold text-light-1">
            @Bekal Opat All Rights Reserved
          </p>
        </div>

      </div>
    </footer>
  );
}