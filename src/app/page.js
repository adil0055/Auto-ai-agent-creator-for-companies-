"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./page.module.css";
import Navbar from "@/components/Navbar/Navbar";
import HeroSection from "@/components/HeroSection/HeroSection";
import PromptBox from "@/components/PromptBox/PromptBox";
import TemplateGallery from "@/components/TemplateGallery/TemplateGallery";
import CapabilitiesGrid from "@/components/CapabilitiesGrid/CapabilitiesGrid";
import AutomationDashboard from "@/components/AutomationDashboard/AutomationDashboard";
import BuilderModal from "@/components/BuilderModal/BuilderModal";
import ExecutionViewer from "@/components/ExecutionViewer/ExecutionViewer";
import StatsBar from "@/components/StatsBar/StatsBar";
import Footer from "@/components/Footer/Footer";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function Home() {
  const [automations, setAutomations] = useState([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [builderPrompt, setBuilderPrompt] = useState("");
  const [activeView, setActiveView] = useState("home");
  const [runningAutomation, setRunningAutomation] = useState(null);
  const [serverConnected, setServerConnected] = useState(false);
  const dashboardRef = useRef(null);

  // Load automations — try API first, fallback to localStorage
  const loadAutomations = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/automations`);
      if (res.ok) {
        const data = await res.json();
        setAutomations(data);
        setServerConnected(true);
        // Sync to localStorage as cache
        localStorage.setItem("af_automations", JSON.stringify(data));
        return;
      }
    } catch (e) {
      console.warn("API unavailable, using localStorage cache");
    }

    // Fallback to localStorage
    setServerConnected(false);
    const saved = localStorage.getItem("af_automations");
    if (saved) {
      try {
        setAutomations(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved automations:", e);
      }
    }
  }, []);

  useEffect(() => {
    loadAutomations();
  }, [loadAutomations]);

  // Save to localStorage when automations change (offline-first)
  useEffect(() => {
    if (automations.length > 0) {
      localStorage.setItem("af_automations", JSON.stringify(automations));
    }
  }, [automations]);

  const handlePromptSubmit = (prompt) => {
    setBuilderPrompt(prompt);
    setShowBuilder(true);
  };

  const handleTemplateSelect = (template) => {
    setBuilderPrompt(template.prompt);
    setShowBuilder(true);
  };

  const handleAutomationCreated = (automation) => {
    setAutomations((prev) => [automation, ...prev]);
    setShowBuilder(false);
    setActiveView("dashboard");
  };

  const handleDeleteAutomation = async (id) => {
    // Try to delete from API
    if (serverConnected) {
      try {
        await fetch(`${API_URL}/api/automations/${id}`, { method: "DELETE" });
      } catch (e) {
        console.warn("API delete failed:", e);
      }
    }

    setAutomations((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      localStorage.setItem("af_automations", JSON.stringify(updated));
      return updated;
    });
  };

  const handleRunAutomation = (automation) => {
    setRunningAutomation(automation);
  };

  const handleRunComplete = () => {
    // Reload automations to get updated stats
    loadAutomations();
  };

  return (
    <div className={styles.app}>
      {/* Background effects */}
      <div className={styles.bgEffects}>
        <div className={styles.bgOrb1} />
        <div className={styles.bgOrb2} />
        <div className={styles.bgOrb3} />
        <div className={styles.bgGrid} />
      </div>

      <Navbar
        activeView={activeView}
        onViewChange={setActiveView}
        automationCount={automations.length}
        serverConnected={serverConnected}
      />

      {activeView === "home" ? (
        <main className={styles.main}>
          <HeroSection />
          <PromptBox onSubmit={handlePromptSubmit} />
          <StatsBar automations={automations} />
          <TemplateGallery onSelect={handleTemplateSelect} />
          <CapabilitiesGrid />
          <Footer />
        </main>
      ) : (
        <main className={styles.main}>
          <AutomationDashboard
            ref={dashboardRef}
            automations={automations}
            onDelete={handleDeleteAutomation}
            onNewAutomation={() => setActiveView("home")}
            onRunAutomation={handleRunAutomation}
          />
        </main>
      )}

      {showBuilder && (
        <BuilderModal
          prompt={builderPrompt}
          onClose={() => setShowBuilder(false)}
          onAutomationCreated={handleAutomationCreated}
          apiUrl={API_URL}
          serverConnected={serverConnected}
        />
      )}

      {runningAutomation && (
        <ExecutionViewer
          automation={runningAutomation}
          onClose={() => setRunningAutomation(null)}
          onRunComplete={handleRunComplete}
        />
      )}
    </div>
  );
}
