import { motion } from 'motion/react';
import Hero from '../components/beranda/Hero';
import FeaturedSection from '../components/beranda/FeaturedSection';
import Terbaru from '../components/beranda/Terbaru';
import Footer from '../components/ui/Footer';

export default function Beranda() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen bg-light-1 dark:bg-gray-900"
        >
            <Hero />
            <FeaturedSection />
            <Terbaru />
            <Footer />
        </motion.div>
    );
}