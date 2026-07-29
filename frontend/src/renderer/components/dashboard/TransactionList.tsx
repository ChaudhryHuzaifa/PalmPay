import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, ShoppingBag, Coffee, Home, Car, CreditCard, Download } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getTransactions, Transaction as ApiTransaction } from '../utils/apiService';
import { useAuthStore } from '../stores/useAuthStore';

export const TransactionList = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const apiTransactions = await getTransactions();
        
        // If no transactions from API, use mock data
        if (apiTransactions.length === 0) {
          setTransactions([
            { id: 1, name: 'Starbucks', amount: -5.75, time: '10:30 AM', type: 'coffee', icon: Coffee },
            { id: 2, name: 'Amazon', amount: -129.99, time: 'Yesterday', type: 'shopping', icon: ShoppingBag },
            { id: 3, name: 'Uber Ride', amount: -23.50, time: '2 days ago', type: 'transport', icon: Car },
            { id: 4, name: 'Freelance Work', amount: 500.00, time: '3 days ago', type: 'income', icon: ArrowDownRight },
            { id: 5, name: 'Netflix', amount: -15.99, time: '1 week ago', type: 'entertainment', icon: Home },
          ]);
        } else {
          // Map API transactions to UI format
          const mappedTransactions = apiTransactions.slice(0, 5).map((tx: ApiTransaction, idx: number) => {
            const isPositive = tx.amount > 0;
            const icons = [Coffee, ShoppingBag, Car, Home, ArrowDownRight, CreditCard, Download];
            const Icon = icons[idx % icons.length];
            
            // Format time
            const txDate = new Date(tx.date);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - txDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            let timeText = '';
            if (diffDays === 0) timeText = 'Today';
            else if (diffDays === 1) timeText = 'Yesterday';
            else if (diffDays < 7) timeText = `${diffDays} days ago`;
            else timeText = txDate.toLocaleDateString();
            
            return {
              id: tx.id,
              name: tx.type === 'received' ? `From ${tx.recipient}` : 
                    tx.type === 'payment' ? tx.recipient : 
                    `To ${tx.recipient}`,
              amount: tx.amount,
              time: timeText,
              type: tx.type,
              icon: Icon,
            };
          });
          
          setTransactions(mappedTransactions);
        }
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
        // Fallback to mock data
        setTransactions([
          { id: 1, name: 'Starbucks', amount: -5.75, time: '10:30 AM', type: 'coffee', icon: Coffee },
          { id: 2, name: 'Amazon', amount: -129.99, time: 'Yesterday', type: 'shopping', icon: ShoppingBag },
          { id: 3, name: 'Uber Ride', amount: -23.50, time: '2 days ago', type: 'transport', icon: Car },
          { id: 4, name: 'Freelance Work', amount: 500.00, time: '3 days ago', type: 'income', icon: ArrowDownRight },
          { id: 5, name: 'Netflix', amount: -15.99, time: '1 week ago', type: 'entertainment', icon: Home },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">Recent Transactions</h3>
        <span className="text-sm text-cyan-400">View All →</span>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-900/50 to-black/50 border border-cyan-500/10 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-700/50"></div>
                <div>
                  <div className="h-4 bg-gray-700/50 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-gray-700/50 rounded w-16"></div>
                </div>
              </div>
              <div className="text-right">
                <div className="h-5 bg-gray-700/50 rounded w-20 mb-1"></div>
                <div className="h-3 bg-gray-700/50 rounded w-12"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((transaction, idx) => {
            const Icon = transaction.icon;
            const isPositive = transaction.amount > 0;
            
            return (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ x: 5 }}
                className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-900/50 to-black/50 border border-cyan-500/10 hover:border-cyan-500/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${isPositive ? 'bg-emerald-500/20' : 'bg-red-500/20'} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`} />
                  </div>
                  <div>
                    <div className="font-semibold">{transaction.name}</div>
                    <div className="text-sm text-gray-400">{transaction.time}</div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-lg font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isPositive ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">{transaction.type}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};