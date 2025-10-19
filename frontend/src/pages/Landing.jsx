import { useRef } from "react";
import HeroSection from "../components/HeroSection";
import ServiceDetail from "../components/ServiceDetail";
import BookingProcedure from "../components/BookingProcedure";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

export default function Landing() {
  const servicesRef = useRef(null);
  const footerRef = useRef(null);

  const scrollToServices = () =>
    servicesRef.current?.scrollIntoView({ behavior: "smooth" });
  const scrollToFooter = () =>
    footerRef.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <div>
      <Navbar
        onScrollToServices={scrollToServices}
        onScrollToFooter={scrollToFooter}
      />
      <div className="mt-[100px]">
        <HeroSection />
      </div>

      <div className="mt-[24px]" ref={servicesRef}>
        <ServiceDetail />
      </div>
      <BookingProcedure />
      <div ref={footerRef}>
        <Footer />
      </div>
    </div>
  );
}
