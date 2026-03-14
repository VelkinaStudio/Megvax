import { MetaAccount } from '@/types/dashboard';
import { RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui';

interface AccountCardProps {
  account: MetaAccount;
  isActive?: boolean;
  onSelect?: () => void;
}

export function AccountCard({ account, isActive, onSelect }: AccountCardProps) {
  return (
    <Card
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (!onSelect) return;
        if (e.key === 'Enter' || e.key === ' ') onSelect();
      }}
      className={`p-6 flex items-center justify-between transition-colors duration-200 ${onSelect ? 'cursor-pointer hover:bg-gray-50' : ''} ${isActive ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
    >
      <div className="flex items-center gap-4">
        <div className={`
          w-12 h-12 rounded-lg flex items-center justify-center
          ${account.status === 'connected' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}
        `}>
          {account.status === 'connected' ? (
            <CheckCircle size={24} />
          ) : (
            <AlertCircle size={24} />
          )}
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{account.name}</h3>
          <p className="font-mono text-xs text-gray-500">ID: {account.accountId}</p>
        </div>
      </div>

      <div className="text-right hidden md:block">
         <p className="text-xs font-medium text-gray-500 uppercase mb-1">Last Sync</p>
         <p className="text-sm font-medium text-gray-600">{account.lastSync}</p>
      </div>

      <div className="flex items-center gap-3">
        <span className={`
          hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
          ${account.status === 'connected' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
        `}>
          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${account.status === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></span>
          {account.status === 'connected' ? 'Connected' : 'Error'}
        </span>

        <button
          onClick={(e) => e.stopPropagation()}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-all"
          title="Resync"
        >
          <RefreshCw size={18} />
        </button>
      </div>
    </Card>
  );
}
