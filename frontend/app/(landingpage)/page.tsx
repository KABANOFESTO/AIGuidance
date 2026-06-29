import HeroSection from "@/app/(landingpage)/HeroSection/page";
import FeaturesSection from "@/app/(landingpage)/Features/page";
import HowItWorksSection from "@/app/(landingpage)/HowItWorks/page";
import RolesSection from "@/app/(landingpage)/Roles/page";

export default function Home() {
    return (
        <>
            <HeroSection />
            <FeaturesSection />
            <HowItWorksSection />
            <RolesSection />
        </>
    );
}