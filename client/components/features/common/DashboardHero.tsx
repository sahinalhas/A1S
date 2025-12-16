import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Brain, GraduationCap } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import { useNavigate } from "react-router-dom";

export function DashboardHero() {
    const navigate = useNavigate();

    return (
        <div className="relative overflow-hidden rounded-3xl p-8 mb-8 group">
            {/* Background with new Mesh Gradient */}
            <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-xl z-0" />
            <div className="absolute inset-0 opacity-20 dark:opacity-10 bg-gradient-to-r from-primary via-accent to-chart-2 animate-gradient-xy z-0" />

            {/* Subtle Grid Pattern */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] dark:opacity-[0.1] z-0" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex-1 space-y-4">
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 backdrop-blur-sm px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                        <Sparkles className="h-3 w-3 mr-1.5 inline-block" />
                        Yeni Nesil Rehberlik
                    </Badge>

                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground tracking-tight leading-tight">
                        Rehber360'a <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Hoş Geldiniz</span>
                    </h1>

                    <p className="text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed">
                        Yapay zeka destekli öğrenci başarı ve takip platformu ile rehberlik süreçlerini dijitalleştirin.
                    </p>

                    <div className="flex flex-wrap gap-3 pt-2">
                        <Button
                            size="lg"
                            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 rounded-xl transition-all hover:scale-[1.02]"
                            onClick={() => navigate('/ogrenci')}
                        >
                            Hemen Başla
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="bg-white/50 dark:bg-black/20 hover:bg-white dark:hover:bg-black/40 border-primary/10 rounded-xl backdrop-blur-sm"
                            onClick={() => navigate('/ai-araclari')}
                        >
                            <Brain className="mr-2 h-4 w-4 text-accent" />
                            AI Asistanım
                        </Button>
                    </div>
                </div>

                {/* 3D Element Placeholder or Illustration */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="hidden lg:block relative"
                >
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                    <div className="relative bg-gradient-to-br from-white/10 to-white/5 border border-white/20 p-6 rounded-2xl backdrop-blur-md shadow-2xl rotate-3 transform transition-transform hover:rotate-0">
                        <GraduationCap className="h-24 w-24 text-primary drop-shadow-xl" />
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
