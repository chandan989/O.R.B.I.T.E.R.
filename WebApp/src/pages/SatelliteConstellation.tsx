import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Satellite, 
  ExternalLink, 
  Calendar, 
  Globe, 
  Zap, 
  TrendingUp,
  Eye,
  MoreVertical 
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

interface SatelliteAsset {
  id: string;
  domain: string;
  mintDate: string;
  blockHeight: number;
  txHash: string;
  status: "active" | "inactive" | "transferring";
  metadata: {
    description: string;
    attributes: Array<{ trait_type: string; value: string }>;
  };
}

const mockAssets: SatelliteAsset[] = [
  {
    id: "0001",
    domain: "myawesomesite.com",
    mintDate: "2024-03-15T10:30:00Z",
    blockHeight: 157293847,
    txHash: "0xa1b2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890",
    status: "active",
    metadata: {
      description: "Premium domain asset tokenized on Aptos",
      attributes: [
        { trait_type: "TLD", value: ".com" },
        { trait_type: "Length", value: "15" },
        { trait_type: "Age", value: "5 years" },
        { trait_type: "Traffic", value: "High" }
      ]
    }
  },
  {
    id: "0002", 
    domain: "crypto-hub.io",
    mintDate: "2024-03-14T15:45:00Z",
    blockHeight: 157290123,
    txHash: "0xb2c3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890ab",
    status: "active",
    metadata: {
      description: "Tech domain with established presence",
      attributes: [
        { trait_type: "TLD", value: ".io" },
        { trait_type: "Length", value: "10" },
        { trait_type: "Age", value: "3 years" },
        { trait_type: "Traffic", value: "Medium" }
      ]
    }
  },
  {
    id: "0003",
    domain: "web3future.xyz", 
    mintDate: "2024-03-13T09:20:00Z",
    blockHeight: 157285456,
    txHash: "0xc3d4e5f67890abcdef1234567890abcdef1234567890abcdef1234567890abcd",
    status: "transferring",
    metadata: {
      description: "Next-gen domain for Web3 innovation",
      attributes: [
        { trait_type: "TLD", value: ".xyz" },
        { trait_type: "Length", value: "11" },
        { trait_type: "Age", value: "1 year" },
        { trait_type: "Traffic", value: "Low" }
      ]
    }
  }
];

export const SatelliteConstellation = () => {
  const [selectedAsset, setSelectedAsset] = useState<SatelliteAsset | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short", 
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-orbital-success text-void-black";
      case "transferring": return "bg-solar-yellow text-void-black";
      case "inactive": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getTldColor = (tld: string) => {
    switch (tld) {
      case ".com": return "bg-ignition-orange text-void-black";
      case ".io": return "bg-preflight-status text-stark-white"; 
      case ".xyz": return "bg-telemetry-accent text-void-black";
      default: return "bg-charred-steel text-stark-white";
    }
  };

  return (
    <div className="space-y-6">
      {/* Constellation Header */}
      <Card className="bg-console-bg border-grid-lines">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-stark-white">
                <Satellite className="h-5 w-5 text-ignition-orange orbit-animation" />
                Satellite Constellation
              </CardTitle>
              <CardDescription>
                Your tokenized domain assets in orbital registry
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                Grid
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"} 
                size="sm"
                onClick={() => setViewMode("list")}
              >
                List
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="console-display p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Globe className="h-4 w-4 text-telemetry-accent" />
                <span className="font-mono text-xs text-telemetry-accent">TOTAL ASSETS</span>
              </div>
              <div className="text-2xl font-mono text-stark-white">{mockAssets.length}</div>
            </div>
            
            <div className="console-display p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-4 w-4 text-orbital-success" />
                <span className="font-mono text-xs text-telemetry-accent">ACTIVE</span>
              </div>
              <div className="text-2xl font-mono text-stark-white">
                {mockAssets.filter(a => a.status === "active").length}
              </div>
            </div>
            
            <div className="console-display p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-solar-yellow" />
                <span className="font-mono text-xs text-telemetry-accent">TRANSFERS</span>
              </div>
              <div className="text-2xl font-mono text-stark-white">
                {mockAssets.filter(a => a.status === "transferring").length}
              </div>
            </div>
            
            <div className="console-display p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-preflight-status" />
                <span className="font-mono text-xs text-telemetry-accent">RECENT</span>
              </div>
              <div className="text-xs font-mono text-stark-white">24H: 1</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Asset Grid/List */}
      <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
        {mockAssets.map((asset, index) => (
          <motion.div
            key={asset.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className="bg-console-bg border-grid-lines hover:border-ignition-orange/50 transition-colors cursor-pointer"
              onClick={() => setSelectedAsset(asset)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Satellite className="h-4 w-4 text-ignition-orange" />
                      <div className={`absolute -top-1 -right-1 h-2 w-2 rounded-full ${
                        asset.status === "active" ? "bg-orbital-success" :
                        asset.status === "transferring" ? "bg-solar-yellow" : "bg-muted"
                      } animate-pulse`} />
                    </div>
                    <span className="font-mono text-xs text-telemetry-accent">#{asset.id}</span>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View on Explorer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div>
                  <h3 className="font-mono text-lg text-stark-white truncate">
                    {asset.domain}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge 
                      variant="secondary"
                      className={getStatusColor(asset.status)}
                    >
                      {asset.status.toUpperCase()}
                    </Badge>
                    <Badge 
                      variant="outline"
                      className={getTldColor(asset.metadata.attributes.find(a => a.trait_type === "TLD")?.value || "")}
                    >
                      {asset.metadata.attributes.find(a => a.trait_type === "TLD")?.value}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="console-display p-3 rounded-lg">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="font-mono text-telemetry-accent block">MINT DATE</span>
                        <span className="font-mono text-stark-white">
                          {formatDate(asset.mintDate).split(",")[0]}
                        </span>
                      </div>
                      <div>
                        <span className="font-mono text-telemetry-accent block">BLOCK</span>
                        <span className="font-mono text-stark-white">
                          #{asset.blockHeight.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {asset.metadata.attributes.slice(1, 3).map((attr, i) => (
                      <div key={i} className="bg-charred-steel p-2 rounded">
                        <span className="font-mono text-telemetry-accent block">{attr.trait_type}</span>
                        <span className="font-mono text-stark-white">{attr.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {mockAssets.length === 0 && (
        <Card className="bg-console-bg border-grid-lines">
          <CardContent className="p-12 text-center">
            <div className="mb-6 opacity-50">
              <Satellite className="h-16 w-16 mx-auto text-muted-foreground" />
            </div>
            <h3 className="text-xl font-heading text-stark-white mb-2">
              No Satellites in Orbit
            </h3>
            <p className="text-muted-foreground mb-6">
              Launch your first domain to see it appear in your constellation
            </p>
            <Button>
              Begin Launch Sequence
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Asset Detail Modal would go here */}
      {selectedAsset && (
        <motion.div 
          className="fixed inset-0 bg-void-black/80 flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setSelectedAsset(null)}
        >
          <motion.div
            className="bg-console-bg border border-grid-lines rounded-lg p-6 max-w-md w-full"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-heading text-stark-white">Asset Details</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedAsset(null)}
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-mono text-telemetry-accent text-sm mb-2">{selectedAsset.domain}</h4>
                <p className="text-muted-foreground text-sm">{selectedAsset.metadata.description}</p>
              </div>
              
              <div className="console-display p-3 rounded-lg">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-mono text-telemetry-accent">Transaction:</span>
                    <div className="flex items-center gap-1">
                      <code className="font-mono text-xs">
                        {selectedAsset.txHash.slice(0, 8)}...{selectedAsset.txHash.slice(-8)}
                      </code>
                      <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-telemetry-accent">Mint Date:</span>
                    <span className="font-mono text-stark-white text-xs">
                      {formatDate(selectedAsset.mintDate)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {selectedAsset.metadata.attributes.map((attr, i) => (
                  <div key={i} className="bg-charred-steel p-2 rounded">
                    <span className="font-mono text-telemetry-accent text-xs block">{attr.trait_type}</span>
                    <span className="font-mono text-stark-white text-sm">{attr.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};