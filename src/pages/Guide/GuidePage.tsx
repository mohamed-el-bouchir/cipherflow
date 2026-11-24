import {useState} from 'react';
import 'bootstrap/dist/css/bootstrap-grid.min.css';
import {ArrowRight, BookOpen, CheckCircle2, ChevronDown, Code2, Film, Layers3, Play, Workflow} from 'lucide-react';
import './guide.css';

type SectionId = 'introduction' | 'getting-started' | 'pipeline' | 'algorithms' | 'animations' | 'recipes';

const sections: {id: SectionId; number: string; label: string; icon: typeof BookOpen}[] = [
  {id: 'introduction', number: '01', label: 'Introduction', icon: BookOpen},
  {id: 'getting-started', number: '02', label: 'Getting started', icon: Play},
  {id: 'pipeline', number: '03', label: 'Building a pipeline', icon: Workflow},
  {id: 'algorithms', number: '04', label: 'Algorithms', icon: Code2},
  {id: 'animations', number: '05', label: 'Understanding animations', icon: Film},
  {id: 'recipes', number: '06', label: 'Managing recipes', icon: Layers3},
];

function GuideCard({number, title, description, children}: {number: string; title: string; description: string; children?: React.ReactNode}) {
  return <section className="guide-card" id={number}>
    <div className="guide-card-heading"><span>{number}</span><div><h3>{title}</h3><p>{description}</p></div></div>
    {children}
  </section>;
}

function Step({number, title, children}: {number: string; title: string; children: React.ReactNode}) {
  return <div className="guide-step"><span className="guide-step-number">{number}</span><div><h4>{title}</h4><p>{children}</p></div></div>;
}

export function GuidePage() {
  const [activeSection, setActiveSection] = useState<SectionId>('introduction');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  function navigateTo(id: SectionId) {
    setActiveSection(id);
    document.getElementById(`guide-${id}`)?.scrollIntoView({behavior: 'smooth', block: 'start'});
  }

  return <main className="guide-page">
    <div className="guide-container">
      <header className="guide-page-header">
        <div><div className="guide-eyebrow">DOCUMENTATION <span>•</span> USER GUIDE</div><h1>Application Guide</h1><p>Learn how to build transformation pipelines, explore algorithms and understand every execution step.</p></div>
        <div className="guide-header-meta"><BookOpen size={17}/><span>6 chapters</span></div>
      </header>

      <div className="guide-layout row g-4">
        <aside className="guide-sidebar col-12 col-lg-3">
          <div className="guide-sidebar-panel">
            <div className="guide-sidebar-title">CONTENTS</div>
            <nav aria-label="Guide chapters">
              {sections.map(({id, number, label, icon: Icon}) => <button key={id} type="button" className={`guide-nav-item ${activeSection === id ? 'active' : ''}`} onClick={() => navigateTo(id)}>
                <Icon size={15}/><span className="guide-nav-number">{number}</span><span>{label}</span>
              </button>)}
            </nav>
            <div className="guide-sidebar-tip"><span className="guide-tip-icon"><CheckCircle2 size={16}/></span><div><strong>Learning tip</strong><p>Follow the chapters in order for your first session.</p></div></div>
          </div>
        </aside>

        <div className="guide-content col-12 col-lg-9">
          <section className="guide-welcome" id="guide-introduction">
            <div className="guide-welcome-copy"><span className="guide-eyebrow">WELCOME TO CIPHERFLOW</span><h2>Make every transformation visible.</h2><p>CipherFlow is an educational workbench for chaining text transformations and cryptographic operations. Instead of showing only the final result, it lets you inspect how each operation changes your data.</p><div className="guide-welcome-actions"><button type="button" onClick={() => navigateTo('getting-started')} className="guide-primary-button">Start learning <ArrowRight size={15}/></button><span>Beginner friendly · 5–10 min</span></div></div>
            <div className="guide-preview" aria-label="Illustration of a transformation pipeline"><div className="guide-preview-label">EXAMPLE PIPELINE</div><div className="guide-preview-node"><span>01</span><div><strong>Caesar Cipher</strong><small>Shift +3</small></div><CheckCircle2 size={16}/></div><div className="guide-preview-connector"></div><div className="guide-preview-node"><span>02</span><div><strong>Base64</strong><small>Encode</small></div><CheckCircle2 size={16}/></div><div className="guide-preview-output"><span>OUTPUT</span><code> S0hPT1IgT0RF</code></div></div>
          </section>

          <div className="guide-section-intro" id="guide-getting-started"><span className="guide-section-kicker">01 / FIRST STEPS</span><h2>Getting started</h2><p>Start with the Workbench: enter text, add operations and inspect the output.</p></div>
          <GuideCard number="A" title="Your first transformation" description="A simple workflow from input to output.">
            <div className="guide-steps">
              <Step number="1" title="Enter your input">Type or paste text in the Input panel. The character and byte counters help you inspect the data size.</Step>
              <Step number="2" title="Add an operation">Select <b>Add Operation</b> in the Recipe panel, then choose an algorithm such as Caesar Cipher or Base64.</Step>
              <Step number="3" title="Configure the operation">Adjust its parameters directly in the operation card. The pipeline updates as you change them.</Step>
              <Step number="4" title="Inspect the result">Use the Animation Stage to follow the transformation, then review the final output panel.</Step>
            </div>
          </GuideCard>

          <div className="guide-section-intro" id="guide-pipeline"><span className="guide-section-kicker">02 / COMPOSITION</span><h2>Building a pipeline</h2><p>A recipe is an ordered sequence of operations. CipherFlow executes enabled operations from left to right.</p></div>
          <GuideCard number="B" title="Working with operation cards" description="Control the order and behavior of each step.">
            <div className="guide-feature-grid">
              <div><Workflow/><strong>Add operations</strong><p>Append a new algorithm to the current pipeline.</p></div>
              <div><ChevronDown/><strong>Reorder steps</strong><p>Use the arrow controls to move an operation up or down.</p></div>
              <div><CheckCircle2/><strong>Enable or disable</strong><p>Toggle a step to include or exclude it from execution.</p></div>
              <div><Layers3/><strong>Reverse order</strong><p>Reverse the operation sequence when your workflow requires it.</p></div>
            </div>
            <div className="guide-note"><strong>Tip</strong><span>Operation order matters: changing the sequence can change the final output.</span></div>
          </GuideCard>

          <div className="guide-section-intro" id="guide-algorithms"><span className="guide-section-kicker">03 / OPERATIONS</span><h2>Available algorithms</h2><p>Each algorithm has its own parameters and visual explanation.</p></div>
          <GuideCard number="C" title="Built-in operations" description="The current set of transformations included in CipherFlow.">
            <div className="guide-algorithm-list">
              <div><span className="guide-algo-symbol">Ca</span><div><strong>Caesar Cipher</strong><p>Shifts letters through the alphabet using a configurable offset.</p></div><span className="guide-category">Cipher</span></div>
              <div><span className="guide-algo-symbol">64</span><div><strong>Base64</strong><p>Encodes text into Base64 or decodes Base64 back into text.</p></div><span className="guide-category">Encoding</span></div>
              <div><span className="guide-algo-symbol">⊕</span><div><strong>XOR Cipher</strong><p>Applies a bitwise XOR operation using a configurable key.</p></div><span className="guide-category">Bitwise</span></div>
              <div><span className="guide-algo-symbol">↔</span><div><strong>Reverse Text</strong><p>Reverses character order, with optional case swapping.</p></div><span className="guide-category">Text</span></div>
            </div>
          </GuideCard>

          <div className="guide-section-intro" id="guide-animations"><span className="guide-section-kicker">04 / EXECUTION</span><h2>Understanding animations</h2><p>Animations expose the intermediate states generated by each algorithm.</p></div>
          <GuideCard number="D" title="Explore each execution stage" description="Navigate the frames and understand the transformation logic.">
            <div className="guide-steps">
              <Step number="01" title="Select a stage">Choose an operation in the Recipe panel to inspect its animation.</Step>
              <Step number="02" title="Navigate frames">Use Previous stage and Next stage, or the playback controls, to move through the explanation.</Step>
              <Step number="03" title="Change playback speed">Select a speed that makes the transformation easier to follow.</Step>
              <Step number="04" title="Compare intermediate data">Observe the input and output of the selected stage to understand what changed.</Step>
            </div>
          </GuideCard>

          <div className="guide-section-intro" id="guide-recipes"><span className="guide-section-kicker">05 / REUSE</span><h2>Managing recipes</h2><p>Save useful operation chains and reuse them later.</p></div>
          <GuideCard number="E" title="Save and load a recipe" description="Keep a reusable configuration of your pipeline.">
            <div className="guide-steps">
              <Step number="1" title="Prepare your pipeline">Add and configure the operations you want to reuse.</Step>
              <Step number="2" title="Save as Recipe">Choose Save as Recipe and provide a name and optional description.</Step>
              <Step number="3" title="Open Recipes">Use the Recipes navigation item to browse built-in and saved recipes.</Step>
              <Step number="4" title="Load a recipe">Select a recipe to restore its sample input, operation sequence and parameters in the Workbench.</Step>
            </div>
          </GuideCard>

          <section className="guide-faq">
            <span className="guide-section-kicker">QUICK HELP</span><h2>Frequently asked questions</h2>
            {[
              ['Does CipherFlow send my input to a server?', 'The current Workbench processes transformations in the browser. Saved custom recipes are stored in your browser local storage.'],
              ['Why does changing the order affect the output?', 'Each operation receives the previous operation’s output. A different order therefore changes the data passed to each step.'],
              ['Can I use a recipe for decoding?', 'Use the Decrypt control when the selected algorithms support inverse parameters. The result depends on the operations and their configuration.'],
            ].map(([question, answer], index) => <div className="guide-faq-item" key={question}><button type="button" onClick={() => setExpandedFaq(expandedFaq === index ? null : index)} aria-expanded={expandedFaq === index}><span>{question}</span><ChevronDown size={16} className={expandedFaq === index ? 'rotated' : ''}/></button>{expandedFaq === index && <p>{answer}</p>}</div>)}
          </section>

          <footer className="guide-footer"><span>That’s the essentials.</span><button type="button" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>Back to top <ArrowRight size={14}/></button></footer>
        </div>
      </div>
    </div>
  </main>;
}
