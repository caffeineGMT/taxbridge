'use client';

import { useState, useEffect } from 'react';
import { Download, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UpgradeModal from '@/components/UpgradeModal';

interface ExportButtonProps {
  rsuId: string | number;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showText?: boolean;
}

export function ExportButton({
  rsuId,
  variant = 'default',
  size = 'default',
  className = '',
  showText = true,
}: ExportButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [canExport, setCanExport] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    // Check if user can export PDF
    const checkSubscription = async () => {
      try {
        const response = await fetch('/api/user');
        if (response.ok) {
          const data = await response.json();
          const isPro = ['pro', 'enterprise'].includes(data.user.subscriptionTier);
          setCanExport(isPro);
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
      }
    };

    checkSubscription();
  }, []);

  const handleExport = async () => {
    // Check subscription before exporting
    if (!canExport) {
      setShowUpgradeModal(true);
      return;
    }

    try {
      setIsLoading(true);

      // Fetch PDF from API
      const response = await fetch(`/api/export/${rsuId}`);

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      // Get PDF blob
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `taxbridge-summary-${rsuId}.pdf`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="PDF export"
      />

      <Button
        onClick={handleExport}
        disabled={isLoading}
        variant={variant}
        size={size}
        className={`gap-2 transition-all ${className}`}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : canExport ? (
          <Download className="h-4 w-4" />
        ) : (
          <Lock className="h-4 w-4" />
        )}
        {showText && (isLoading ? 'Generating...' : canExport ? 'Export PDF' : 'Upgrade to Export')}
      </Button>
    </>
  );
}
