import { useEffect, useState } from "react";
import { NavLink } from "@/components/NavLink";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, ShoppingCart, Loader2, Zap, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { fetchProducts, addToCart, fetchWalletInfo } from "@/lib/authClient";
import type { Product } from "@/types";

type WalletInfo = {
  address: string | null;
  balance: number;
  symbol: string;
};

const Marketplace = () => {
  const {  } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<WalletInfo | null>(null);

  useEffect(() => {
    const loadMarketplaceData = async () => {
      try {
        setLoading(true);
        // Fetch products and wallet info in parallel
        const [productsData, walletData] = await Promise.all([
          fetchProducts(),
          fetchWalletInfo()
        ]);
        setProducts(productsData);
        setWallet(walletData);
      } catch (error) {
        console.error("Error loading marketplace:", error);
        toast.error("Failed to fetch marketplace data.");
      } finally {
        setLoading(false);
      }
    };
    loadMarketplaceData();
  }, []);

  const handleAddToCart = async (productId: number) => {
    try {
      await addToCart(productId, 1);
      toast.success("Item added to cart! 🛒");
    } catch (error) {
      toast.error("Failed to add item to cart.");
    }
  };

  return (
    <div className="pb-20 px-4 pt-6 max-w-lg mx-auto min-h-screen">
      {/* Wallet Header (Same logic as Home) */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Marketplace</h1>
          <p className="text-sm text-muted-foreground italic font-medium uppercase tracking-wider">Redeem your Rewards</p>
        </div>
        <NavLink to="/cart">
          <Button variant="outline" size="icon" className="relative border-accent/20 hover:bg-accent/10">
            <ShoppingCart className="w-5 h-5 text-accent" />
            <span className="absolute -top-1 -right-1 bg-secondary text-secondary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-background animate-pulse">
              !
            </span>
          </Button>
        </NavLink>
      </div>

      {/* Wallet Info Card (Same logic as Home) */}
      <Card className="p-5 mb-8 shadow-card gradient-card border-accent/20">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-accent/10 rounded-full border border-accent/10">
            <Zap className="w-3.5 h-3.5 text-accent fill-accent" />
            <span className="text-[10px] font-black text-accent uppercase tracking-widest">Premium Rewards</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
             <Wallet className="w-3 h-3" />
             <span className="text-[8px] font-mono opacity-50 uppercase tracking-tighter">
                {wallet?.address ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}` : 'No Wallet Connected'}
             </span>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">Available Balance</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-foreground tracking-tighter italic">
               {wallet?.balance ?? 0}
            </span>
            <span className="text-sm font-black text-accent uppercase italic tracking-widest">
               {wallet?.symbol ?? 'EDU'}
            </span>
          </div>
        </div>
      </Card>

      {/* Products Section */}
      <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-4 flex items-center gap-2 px-1">
        <Coins className="w-3 h-3" /> Featured Items
      </h2>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Browsing Inventory...</p>
        </div>
      ) : products.length === 0 ? (
        <Card className="p-10 text-center border-dashed border-2 bg-transparent border-muted-foreground/20">
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">The shop is currently empty.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {products.map((item) => (
            <Card
              key={item.id}
              className="p-4 transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] border-accent/10 bg-card/50 backdrop-blur-sm shadow-card"
            >
              <div className="flex gap-4">
                <div className="w-24 h-24 rounded-xl bg-secondary/10 flex items-center justify-center text-3xl flex-shrink-0 border border-secondary/20 overflow-hidden">
                  {item.thumbnail ? (
                    <img src={item.thumbnail} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="p-4 bg-gradient-to-br from-secondary/20 to-accent/10 w-full h-full flex items-center justify-center italic font-black text-secondary/40 text-xl">
                       ITEM
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div className="min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-bold text-foreground text-lg tracking-tight truncate leading-tight uppercase italic">{item.name}</h3>
                      <div className="flex items-center gap-1 bg-secondary/10 px-2.5 py-1 rounded-lg flex-shrink-0 border border-secondary/20 shadow-sm">
                        <Coins className="w-3.5 h-3.5 text-secondary fill-secondary/20" />
                        <span className="text-sm font-black text-secondary tracking-tighter">{item.points_price}</span>
                      </div>
                    </div>
                    <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-1">{item.category_name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{item.description}</p>
                  </div>
                  <Button
                    size="sm"
                    className="w-full mt-3 bg-foreground text-background hover:bg-foreground/90 font-black uppercase tracking-widest text-[10px] h-9 shadow-lg"
                    onClick={() => handleAddToCart(item.id)}
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Marketplace;