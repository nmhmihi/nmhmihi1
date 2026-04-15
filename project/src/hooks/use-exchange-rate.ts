
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = 'exchangeRate_v1';

export function useExchangeRate() {
  const { toast } = useToast();
  const [exchangeRate, setExchangeRate] = useState<number>(780);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedRate = localStorage.getItem(STORAGE_KEY);
      if (storedRate) {
        setExchangeRate(parseFloat(storedRate));
      }
    } catch (error) {
      console.error("Failed to load exchange rate from local storage", error);
    }
    setIsLoading(false);
  }, []);

  const updateExchangeRate = useCallback((newRate: number) => {
    if (isNaN(newRate) || newRate <= 0) {
      toast({ variant: "destructive", title: "Lỗi", description: "Tỷ giá không hợp lệ.", duration: 500 });
      return;
    }
    try {
      setExchangeRate(newRate);
      localStorage.setItem(STORAGE_KEY, newRate.toString());
      toast({ title: "Thành công", description: `Tỷ giá đã được cập nhật thành ${newRate.toLocaleString()} VND.`, duration: 500 });
    } catch (error) {
       console.error("Failed to save exchange rate to local storage", error);
       toast({ variant: "destructive", title: "Lỗi", description: "Không thể lưu tỷ giá.", duration: 500 });
    }
  }, [toast]);

  return { exchangeRate, updateExchangeRate, isLoading };
}
