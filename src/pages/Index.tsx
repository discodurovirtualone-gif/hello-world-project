import { motion } from "framer-motion";

const projects = [
  { id: "01", title: "Vertex Systems", meta: "2024 / SYSTEMS" },
  { id: "02", title: "Monolith UI", meta: "2024 / INTERFACE" },
  { id: "03", title: "Grid Protocol", meta: "2023 / INFRASTRUCTURE" },
  { id: "04", title: "Signal Architecture", meta: "2023 / PLATFORM" },
  { id: "05", title: "Cold Storage", meta: "2022 / DATA" },
];

const ProjectRow = ({ id, title, meta }: { id: string; title: string; meta: string }) => (
  <motion.div
    whileHover={{ backgroundColor: "#E5E5E5", color: "#0A0A0A" }}
    transition={{ type: "spring", duration: 0.4, bounce: 0 }}
    className="grid grid-cols-12 border-t border-border py-6 md:py-8 px-4 cursor-crosshair"
  >
    <span className="col-span-2 md:col-span-1 font-mono text-xs uppercase tracking-widest tabular self-center">
      {id}
    </span>
    <motion.h2
      className="col-span-7 md:col-span-8 font-display text-2xl md:text-5xl italic font-light tracking-tight"
      whileHover={{ x: 16 }}
      transition={{ type: "spring", duration: 0.4, bounce: 0 }}
    >
      {title}
    </motion.h2>
    <span className="col-span-3 font-mono text-[10px] md:text-xs uppercase tracking-widest text-right self-end">
      [ {meta} ]
    </span>
  </motion.div>
);

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-12 md:w-16 border-r border-border z-50 flex flex-col justify-between items-center py-6">
        <span className="font-mono text-[9px] uppercase tracking-widest [writing-mode:vertical-rl] rotate-180 text-muted-foreground">
          40.7128° N
        </span>
        <div className="flex flex-col items-center gap-3">
          <div className="w-2 h-2 rounded-none bg-primary" />
          <span className="font-mono text-[8px] uppercase tracking-widest [writing-mode:vertical-rl] rotate-180 text-primary">
            Available
          </span>
        </div>
        <span className="font-mono text-[9px] uppercase tracking-widest [writing-mode:vertical-rl] rotate-180 text-muted-foreground">
          74.0060° W
        </span>
      </div>

      {/* Main content */}
      <div className="ml-12 md:ml-16">
        {/* Hero */}
        <section className="relative h-screen flex flex-col justify-end border-b border-border px-4 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", duration: 0.8, bounce: 0 }}
          >
            <h1 className="font-display text-[15vw] leading-[0.85] font-light italic tracking-tight">
              Hola
              <br />
              Mundo
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="font-mono text-[10px] md:text-xs uppercase tracking-[0.08em] mt-8 max-w-md text-muted-foreground"
          >
            Systems-driven design for the next internet.
          </motion.p>
        </section>

        {/* Projects */}
        <section className="py-[20vh]">
          <div className="px-4 mb-12">
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
              Selected Work — {projects.length} Projects
            </span>
          </div>
          <div>
            {projects.map((project) => (
              <ProjectRow key={project.id} {...project} />
            ))}
            <div className="border-t border-border" />
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border px-4 py-8 grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
              © 2026
            </span>
          </div>
          <div className="col-span-12 md:col-span-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
              Design as an engineering discipline.
            </span>
          </div>
          <div className="col-span-12 md:col-span-4 text-right">
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-primary cursor-crosshair">
              ↗ Contact
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
