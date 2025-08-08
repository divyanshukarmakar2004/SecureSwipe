import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, Shield, Palette, Bell } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useSettings } from "@/contexts/SettingsContext";
import { useToast } from "@/hooks/use-toast";

interface SettingsPageProps {
  onLogout: () => void;
}

export function SettingsPage({ onLogout }: SettingsPageProps) {
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings } = useSettings();
  const { toast } = useToast();
  
  const [localSettings, setLocalSettings] = useState({
    highRiskThreshold: [settings.highRiskThreshold],
    showHighRiskOnly: settings.showHighRiskOnly,
    realTimeNotifications: settings.realTimeNotifications,
    emailAlerts: settings.emailAlerts,
  });

  const handleSaveSettings = () => {
    updateSettings({
      highRiskThreshold: localSettings.highRiskThreshold[0],
      showHighRiskOnly: localSettings.showHighRiskOnly,
      realTimeNotifications: localSettings.realTimeNotifications,
      emailAlerts: localSettings.emailAlerts,
    });
    
    toast({
      title: "Settings Saved",
      description: "Your settings have been saved successfully.",
    });
  };

  return (
    <DashboardLayout onLogout={onLogout} pageTitle="Settings">
      <div className="max-w-2xl space-y-6">
        {/* Appearance Settings */}
        <Card className="dashboard-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              <CardTitle>Appearance</CardTitle>
            </div>
            <CardDescription>
              Customize the look and feel of your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark themes
                </p>
              </div>
              <Switch
                id="dark-mode"
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Fraud Detection Settings */}
        <Card className="dashboard-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-destructive" />
              <CardTitle>Fraud Detection</CardTitle>
            </div>
            <CardDescription>
              Configure fraud detection parameters and thresholds
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="risk-threshold">
                High-Risk Threshold: {localSettings.highRiskThreshold[0]} flagged transactions
              </Label>
              <Slider
                id="risk-threshold"
                min={1}
                max={20}
                step={1}
                value={localSettings.highRiskThreshold}
                onValueChange={(value) => setLocalSettings(prev => ({ ...prev, highRiskThreshold: value }))}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Users with more than {localSettings.highRiskThreshold[0]} flagged transactions will be marked as high-risk
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="high-risk-only">Show High-Risk Users Only</Label>
                <p className="text-sm text-muted-foreground">
                  Filter the user list to show only high-risk users
                </p>
              </div>
              <Switch
                id="high-risk-only"
                checked={localSettings.showHighRiskOnly}
                onCheckedChange={(checked) => setLocalSettings(prev => ({ ...prev, showHighRiskOnly: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="dashboard-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-warning" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>
              Manage how you receive alerts and notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="realtime-notifications">Real-Time Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Get instant notifications for new flagged transactions
                </p>
              </div>
              <Switch
                id="realtime-notifications"
                checked={localSettings.realTimeNotifications}
                onCheckedChange={(checked) => setLocalSettings(prev => ({ ...prev, realTimeNotifications: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="email-alerts">Email Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email notifications for high-risk activities
                </p>
              </div>
              <Switch
                id="email-alerts"
                checked={localSettings.emailAlerts}
                onCheckedChange={(checked) => setLocalSettings(prev => ({ ...prev, emailAlerts: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSaveSettings}
            className="bg-gradient-primary hover:opacity-90"
          >
            <SettingsIcon className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}