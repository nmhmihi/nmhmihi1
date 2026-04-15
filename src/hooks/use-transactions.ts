
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import type { Transaction } from '@/lib/types';

const TRANSACTIONS_KEY = 'transactions_v1';
const DELETED_KEY = 'lastDeletedBatch_v1';

interface TransactionFormData {
  senderName: string;
  twdAmount: number;
  feeTwd: number | undefined;
}

export function useTransactions(userId?: string, exchangeRate?: number) {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [lastDeletedBatch, setLastDeletedBatch] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    setIsLoading(true);
    try {
      const storedTransactions = localStorage.getItem(TRANSACTIONS_KEY);
      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions));
      }
      const storedDeleted = localStorage.getItem(DELETED_KEY);
      if (storedDeleted) {
        setLastDeletedBatch(JSON.parse(storedDeleted));
      }
    } catch (error) {
      console.error("Failed to load transactions from storage", error);
    }
    setIsLoading(false);
  }, []);

  const saveTransactions = (newTransactions: Transaction[]) => {
    setTransactions(newTransactions);
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(newTransactions));
  };
  
  const saveDeletedBatch = (deletedBatch: Transaction[]) => {
      setLastDeletedBatch(deletedBatch);
      localStorage.setItem(DELETED_KEY, JSON.stringify(deletedBatch));
  }

  const addTransaction = useCallback((data: TransactionFormData) => {
    if (exchangeRate === undefined) return;
    
    const twdAmount = data.twdAmount;
    const newTransaction: Transaction = {
      id: new Date().toISOString() + Math.random(),
      senderName: data.senderName,
      twdAmount: twdAmount,
      feeTwd: data.feeTwd || 0,
      vndAmount: twdAmount * exchangeRate,
      timestamp: new Date().toISOString(),
      exchangeRate: exchangeRate,
      tag: 'self',
    };

    saveTransactions([newTransaction, ...transactions]);
    toast({ title: "Thành công", description: "Đã thêm giao dịch mới.", duration: 500 });

  }, [transactions, exchangeRate, toast]);

  const editTransaction = useCallback((id: string, data: TransactionFormData, originalExchangeRate: number) => {
    const twdAmount = data.twdAmount;
    const updatedTransactions = transactions.map(t => 
      t.id === id 
        ? {
            ...t,
            senderName: data.senderName,
            twdAmount: twdAmount,
            feeTwd: data.feeTwd !== undefined ? data.feeTwd : t.feeTwd,
            vndAmount: twdAmount * originalExchangeRate,
          }
        : t
    );
    saveTransactions(updatedTransactions);
    toast({ title: "Thành công", description: "Đã cập nhật giao dịch.", duration: 500 });
  }, [transactions, toast]);

  const deleteTransaction = useCallback((ids: string[]) => {
    const transactionsToDelete = transactions.filter(t => ids.includes(t.id));
    const newTransactions = transactions.filter(t => !ids.includes(t.id));
    
    if (transactionsToDelete.length > 0) {
      saveDeletedBatch(transactionsToDelete);
      saveTransactions(newTransactions);
      toast({ title: "Thành công", description: `Đã xóa ${transactionsToDelete.length} giao dịch.`, duration: 500 });
    }
  }, [transactions, toast]);

  const toggleTransactionTag = useCallback((id: string) => {
    const updatedTransactions = transactions.map(t => 
      t.id === id 
        ? { ...t, tag: t.tag === 'other' ? 'self' : 'other' }
        : t
    );
    saveTransactions(updatedTransactions);
  }, [transactions]);

  const resetTransactions = useCallback(() => {
    if (transactions.length === 0) return;
    saveDeletedBatch([...transactions]);
    saveTransactions([]);
    toast({
        title: "Đã xóa toàn bộ giao dịch",
        description: "Bạn có thể khôi phục lại dữ liệu vừa xóa.",
        duration: 500
    });
  }, [transactions, toast]);

  const restoreLastDeleted = useCallback(() => {
    if (lastDeletedBatch.length === 0) {
      toast({ variant: "destructive", title: "Không có gì để khôi phục", duration: 500 });
      return;
    }
    
    const restoredTransactions = [...lastDeletedBatch, ...transactions];
    saveTransactions(restoredTransactions);
    saveDeletedBatch([]);
    toast({ title: "Thành công", description: `Đã khôi phục ${lastDeletedBatch.length} giao dịch.`, duration: 500 });
  }, [lastDeletedBatch, transactions, toast]);

  return { 
    transactions, 
    isLoading, 
    addTransaction, 
    editTransaction,
    deleteTransaction, 
    resetTransactions, 
    restoreLastDeleted,
    lastDeletedBatch,
    toggleTransactionTag,
  };
}
