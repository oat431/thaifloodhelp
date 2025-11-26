import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Key, Copy, Check, Trash2, Plus, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";

interface ApiKey {
  id: string;
  api_key: string;
  name: string;
  created_at: string;
  last_used_at: string | null;
  rate_limit_per_minute: number;
  is_active: boolean;
}

export const ApiKeyManager = () => {
  const { user } = useAuth();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchApiKeys();
    }
  }, [user]);

  const fetchApiKeys = async () => {
    try {
      const { data, error } = await supabase
        .from("api_keys")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (error) {
      console.error("Error fetching API keys:", error);
      toast.error("ไม่สามารถโหลด API Keys ได้");
    } finally {
      setLoading(false);
    }
  };

  const generateApiKey = () => {
    // Generate a secure random API key
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return 'tfh_' + Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  };

  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      toast.error("กรุณาใส่ชื่อ API Key");
      return;
    }

    setCreating(true);
    try {
      const newKey = generateApiKey();
      const { error } = await supabase
        .from("api_keys")
        .insert({
          user_id: user!.id,
          api_key: newKey,
          name: newKeyName.trim(),
          rate_limit_per_minute: 60
        });

      if (error) throw error;

      toast.success("สร้าง API Key สำเร็จ");
      setNewKeyName("");
      fetchApiKeys();
    } catch (error) {
      console.error("Error creating API key:", error);
      toast.error("ไม่สามารถสร้าง API Key ได้");
    } finally {
      setCreating(false);
    }
  };

  const deleteApiKey = async (id: string) => {
    try {
      const { error } = await supabase
        .from("api_keys")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("ลบ API Key สำเร็จ");
      fetchApiKeys();
    } catch (error) {
      console.error("Error deleting API key:", error);
      toast.error("ไม่สามารถลบ API Key ได้");
    }
  };

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  };

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
    toast.success("คัดลอก API Key แล้ว");
  };

  const maskApiKey = (key: string) => {
    return key.substring(0, 8) + "..." + key.substring(key.length - 8);
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Keys
          </CardTitle>
          <CardDescription>
            กรุณาเข้าสู่ระบบเพื่อจัดการ API Keys
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          API Keys
        </CardTitle>
        <CardDescription>
          จัดการ API Keys สำหรับเรียกใช้งาน API แต่ละ Key มี Rate Limit 60 requests/minute
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="ชื่อ API Key (เช่น Production, Development)"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createApiKey()}
          />
          <Button onClick={createApiKey} disabled={creating}>
            <Plus className="h-4 w-4 mr-2" />
            สร้าง Key
          </Button>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground py-8">กำลังโหลด...</p>
        ) : apiKeys.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">ยังไม่มี API Keys</p>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ชื่อ</TableHead>
                  <TableHead>API Key</TableHead>
                  <TableHead>Rate Limit</TableHead>
                  <TableHead>ใช้งานล่าสุด</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">{key.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {visibleKeys.has(key.id) ? key.api_key : maskApiKey(key.api_key)}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleKeyVisibility(key.id)}
                        >
                          {visibleKeys.has(key.id) ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(key.api_key, key.id)}
                        >
                          {copiedKey === key.id ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{key.rate_limit_per_minute}/min</TableCell>
                    <TableCell>
                      {key.last_used_at ? (
                        formatDistanceToNow(new Date(key.last_used_at), {
                          addSuffix: true,
                          locale: th
                        })
                      ) : (
                        <span className="text-muted-foreground">ยังไม่เคยใช้</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={key.is_active ? "default" : "secondary"}>
                        {key.is_active ? "ใช้งานได้" : "ปิดการใช้งาน"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteApiKey(key.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
