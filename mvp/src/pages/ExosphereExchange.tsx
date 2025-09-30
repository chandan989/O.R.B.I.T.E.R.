import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Globe, 
  TrendingUp, 
  Clock, 
  ExternalLink,
  Filter,
  Search,
  ArrowUpDown,
  Eye,
  Star
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useWallet } from "../components/Layout";

interface IncomingTrajectory {
  id: string;
  domain: string;
  owner: string;
  mintDate: string;
  listingPrice?: number;
  volume24h?: number;
  floorPrice?: number;
  rarity: "common" | "rare" | "legendary";
  attributes: Array<{ trait_type: string; value: string }>;
  status: "listed" | "sold" | "minting" | "transferring";
}

const mockTrajectories: IncomingTrajectory[] = [
  {
    id: "TRJ-001",
    domain: "blockchain-hub.com",
    owner: "0x1a2b...7890",
    mintDate: "2024-03-15T14:30:00Z",
    listingPrice: 12.5,
    volume24h: 45.2,
    floorPrice: 8.0,
    rarity: "legendary",
    attributes: [
      { trait_type: "TLD", value: ".com" },
      { trait_type: "Length", value: "13" },
      { trait_type: "Age", value: "8 years" },
      { trait_type: "Traffic", value: "Very High" }
    ],
    status: "listed"
  },
  {
    id: "TRJ-002", 
    domain: "nft-gallery.io",
    owner: "0x2b3c...8901",
    mintDate: "2024-03-15T13:15:00Z",
    listingPrice: 6.8,
    volume24h: 23.1,
    floorPrice: 5.5,
    rarity: "rare",
    attributes: [
      { trait_type: "TLD", value: ".io" },
      { trait_type: "Length", value: "11" },
      { trait_type: "Age", value: "4 years" },
      { trait_type: "Traffic", value: "High" }
    ],
    status: "listed"
  },
  {
    id: "TRJ-003",
    domain: "web3-dev.xyz",
    owner: "0x3c4d...9012", 
    mintDate: "2024-03-15T12:45:00Z",
    rarity: "common",
    attributes: [
      { trait_type: "TLD", value: ".xyz" },
      { trait_type: "Length", value: "9" },
      { trait_type: "Age", value: "2 years" },
      { trait_type: "Traffic", value: "Medium" }
    ],
    status: "minting"
  },
  {
    id: "TRJ-004",
    domain: "crypto-news.org",
    owner: "0x4d5e...0123",
    mintDate: "2024-03-15T11:20:00Z", 
    listingPrice: 15.0,
    volume24h: 67.8,
    floorPrice: 12.0,
    rarity: "rare",
    attributes: [
      { trait_type: "TLD", value: ".org" },
      { trait_type: "Length", value: "11" },
      { trait_type: "Age", value: "6 years" },
      { trait_type: "Traffic", value: "Very High" }
    ],
    status: "sold"
  }
];

export const ExosphereExchange = () => {
  const { isWalletConnected } = useWallet();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [filterRarity, setFilterRarity] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric", 
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "legendary": return "bg-gradient-ignition text-void-black";
      case "rare": return "bg-telemetry-accent text-void-black";
      case "common": return "bg-charred-steel text-stark-white";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "listed": return "bg-orbital-success text-void-black";
      case "sold": return "bg-muted text-muted-foreground";
      case "minting": return "bg-solar-yellow text-void-black";
      case "transferring": return "bg-preflight-status text-stark-white";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const filteredTrajectories = mockTrajectories
    .filter(trajectory => {
      const matchesSearch = trajectory.domain.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRarity = filterRarity === "all" || trajectory.rarity === filterRarity;
      const matchesStatus = filterStatus === "all" || trajectory.status === filterStatus;
      return matchesSearch && matchesRarity && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-high": return (b.listingPrice || 0) - (a.listingPrice || 0);
        case "price-low": return (a.listingPrice || 0) - (b.listingPrice || 0);
        case "recent": return new Date(b.mintDate).getTime() - new Date(a.mintDate).getTime();
        default: return 0;
      }
    });

  return (
    <div className="space-y-6">
      {/* Exosphere Header */}
      <Card className="bg-console-bg border-grid-lines">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-stark-white">
            <Globe className="h-5 w-5 text-ignition-orange" />
            The Exosphere - Orbital Exchange
          </CardTitle>
          <CardDescription>
            Track incoming trajectories and orbital marketplace activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="console-display p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-orbital-success" />
                <span className="font-mono text-xs text-telemetry-accent">24H VOLUME</span>
              </div>
              <div className="text-2xl font-mono text-stark-white">
                {mockTrajectories.reduce((sum, t) => sum + (t.volume24h || 0), 0).toFixed(1)} APT
              </div>
            </div>
            
            <div className="console-display p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-solar-yellow" />
                <span className="font-mono text-xs text-telemetry-accent">NEW LISTINGS</span>
              </div>
              <div className="text-2xl font-mono text-stark-white">
                {mockTrajectories.filter(t => t.status === "listed").length}
              </div>
            </div>
            
            <div className="console-display p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Star className="h-4 w-4 text-ignition-orange" />
                <span className="font-mono text-xs text-telemetry-accent">FLOOR PRICE</span>
              </div>
              <div className="text-2xl font-mono text-stark-white">
                {Math.min(...mockTrajectories.map(t => t.floorPrice || Infinity)).toFixed(1)} APT
              </div>
            </div>
            
            <div className="console-display p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Globe className="h-4 w-4 text-telemetry-accent" />
                <span className="font-mono text-xs text-telemetry-accent">TOTAL ASSETS</span>
              </div>
              <div className="text-2xl font-mono text-stark-white">{mockTrajectories.length}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card className="bg-console-bg border-grid-lines">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search domains..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 font-mono bg-charred-steel border-grid-lines"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px] bg-charred-steel border-grid-lines">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterRarity} onValueChange={setFilterRarity}>
                <SelectTrigger className="w-[120px] bg-charred-steel border-grid-lines">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Rarity</SelectItem>
                  <SelectItem value="legendary">Legendary</SelectItem>
                  <SelectItem value="rare">Rare</SelectItem>
                  <SelectItem value="common">Common</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[120px] bg-charred-steel border-grid-lines">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="listed">Listed</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="minting">Minting</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trajectories List */}
      <div className="space-y-4">
        {filteredTrajectories.map((trajectory, index) => (
          <motion.div
            key={trajectory.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="bg-console-bg border-grid-lines hover:border-ignition-orange/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Domain Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="relative">
                        <Globe className="h-5 w-5 text-ignition-orange" />
                        <div className="absolute -top-1 -right-1 h-2 w-2 bg-orbital-success rounded-full animate-pulse" />
                      </div>
                      <h3 className="font-mono text-lg text-stark-white">{trajectory.domain}</h3>
                      <Badge 
                        variant="secondary"
                        className={getRarityColor(trajectory.rarity)}
                      >
                        {trajectory.rarity.toUpperCase()}
                      </Badge>
                      <Badge 
                        variant="outline"
                        className={getStatusColor(trajectory.status)}
                      >
                        {trajectory.status.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="font-mono">
                        Owner: <code className="bg-charred-steel px-1 rounded">{trajectory.owner}</code>
                      </span>
                      <span className="font-mono">Minted: {formatDate(trajectory.mintDate)}</span>
                    </div>
                  </div>
                  
                  {/* Attributes */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                    {trajectory.attributes.map((attr, i) => (
                      <div key={i} className="bg-charred-steel p-2 rounded text-center">
                        <div className="font-mono text-xs text-telemetry-accent">{attr.trait_type}</div>
                        <div className="font-mono text-sm text-stark-white">{attr.value}</div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Price Info */}
                  <div className="flex flex-col lg:items-end gap-2 lg:min-w-[200px]">
                    {trajectory.listingPrice && (
                      <div className="text-right">
                        <div className="text-2xl font-mono text-stark-white">
                          {trajectory.listingPrice} APT
                        </div>
                        <div className="text-sm font-mono text-muted-foreground">
                          ${(trajectory.listingPrice * 8.5).toFixed(0)} USD
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Explorer
                      </Button>
                      {trajectory.status === "listed" && trajectory.listingPrice && isWalletConnected && (
                        <Button
                          size="sm"
                          className="bg-gradient-ignition text-void-black"
                        >
                          Buy Now
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTrajectories.length === 0 && (
        <Card className="bg-console-bg border-grid-lines">
          <CardContent className="p-12 text-center">
            <div className="mb-6 opacity-50">
              <Globe className="h-16 w-16 mx-auto text-muted-foreground" />
            </div>
            <h3 className="text-xl font-heading text-stark-white mb-2">
              No Trajectories Detected
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm ? 
                "No assets match your search criteria" : 
                "No incoming trajectories in the orbital exchange"
              }
            </p>
            <Button onClick={() => {
              setSearchTerm("");
              setFilterRarity("all"); 
              setFilterStatus("all");
            }}>
              Reset Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Trading Notice */}
      <Card className="bg-solar-yellow/10 border-solar-yellow/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <Star className="h-4 w-4 text-solar-yellow mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-solar-yellow">MVP Notice:</p>
              <p className="text-muted-foreground mt-1">
                The Exosphere currently displays tracking data for newly minted assets. 
                Full trading functionality will be available in future updates.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
