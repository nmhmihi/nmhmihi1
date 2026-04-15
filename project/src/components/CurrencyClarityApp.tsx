"use client";

import React, { useState, useMemo, useEffect } from 'react';
import type { Transaction } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from 'date-fns';
import { Settings, PlusCircle, Edit3, Trash2, TrendingUp, Sigma, RotateCcw, History, UserCheck, Eye, EyeOff, FlaskConical } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useTransactions } from '@/hooks/use-transactions';
import { useExchangeRate } from '@/hooks/use-exchange-rate';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


const transactionSchema = z.object({
  senderName: z.string().trim().min(1, { message: "Tên người gửi không được để trống" }),
  twdAmount: z.string().optional(),
  feeTwd: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;


interface ExchangeRateSetupProps {
  rate: number;
  onRateChange: (newRate: number) => void;
}

const ExchangeRateSetup: React.FC<ExchangeRateSetupProps> = ({ rate, onRateChange }) => {
  const [localRate, setLocalRate] = useState(rate.toString());
  const { toast } = useToast();

  React.useEffect(() => {
    setLocalRate(rate.toString());
  }, [rate]);

  const handleSetRate = () => {
    const newRate = parseFloat(localRate);
    if (!isNaN(newRate) && newRate > 0) {
      onRateChange(newRate);
    } else {
      toast({variant: "destructive", title: "Lỗi", description: "Tỷ giá không hợp lệ."});
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 p-3 rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5 text-muted-foreground" />
        <label htmlFor="exchangeRateInput" className="text-xs font-medium text-muted-foreground whitespace-nowrap">Tỷ giá (1 TWD = {rate.toLocaleString()} VND):</label>
      </div>
      <div className="flex items-center space-x-2 flex-grow">
        <Input
          id="exchangeRateInput"
          type="number"
          value={localRate}
          onChange={(e) => setLocalRate(e.target.value)}
          placeholder="Nhập tỷ giá mới"
          aria-label="Tỷ giá TWD sang VND"
          className="flex-grow h-9"
          autoComplete="off"
        />
        <Button onClick={handleSetRate} size="sm">Cập nhật</Button>
      </div>
    </div>
  );
};

interface TransactionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { senderName: string; twdAmount: number; feeTwd: number | undefined; }) => void;
  defaultValues: Partial<TransactionFormData & { twdAmount: number | undefined, feeTwd: number | undefined }>;
  isEdit?: boolean;
}

const TransactionDialog: React.FC<TransactionDialogProps> = ({ isOpen, onOpenChange, onSubmit, defaultValues, isEdit = false }) => {
  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      senderName: defaultValues?.senderName || '',
      twdAmount: defaultValues?.twdAmount !== undefined ? String(defaultValues.twdAmount) : '',
      feeTwd: defaultValues?.feeTwd !== undefined ? String(defaultValues.feeTwd) : '100',
    }
  });
  
  const feeOptions = [100];
  const [showCustomFeeInput, setShowCustomFeeInput] = useState(() => {
    const initialFee = Number(defaultValues?.feeTwd);
    return !isNaN(initialFee) && !feeOptions.includes(initialFee);
  });
  
  const handleSubmit: SubmitHandler<TransactionFormData> = (data) => {
    const numericData = {
      senderName: data.senderName,
      twdAmount: data.twdAmount && data.twdAmount.trim() !== '' ? Number(data.twdAmount) : 0,
      feeTwd: data.feeTwd && data.feeTwd.trim() !== '' ? Number(data.feeTwd) : undefined,
    };
    if (isNaN(numericData.twdAmount)) {
      form.setError("twdAmount", { type: "manual", message: "Số tiền không hợp lệ" });
      return;
    }
    onSubmit(numericData);
    onOpenChange(false);
  };

  const handleFeeChange = (value: string) => {
    if (value === 'other') {
      setShowCustomFeeInput(true);
      form.setValue('feeTwd', '');
    } else {
      setShowCustomFeeInput(false);
      form.setValue('feeTwd', value);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-0 top-[25%]" hideCloseButton={!isEdit}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} autoComplete="off">
            <DialogHeader className="p-0">
               {!isEdit && (
                <div className="bg-muted flex items-center justify-center py-0 w-full rounded-t-lg my-0">
                  <h1 className="text-2xl font-semibold tracking-wider text-muted-foreground/80 font-headline py-1">NMHMIHI</h1>
                </div>
              )}
              <div className="px-6">
                <DialogTitle className={cn("text-lg font-semibold", { 'sr-only': !isEdit })}>
                  {isEdit ? 'Sửa Giao Dịch' : 'Thêm Giao Dịch Mới'}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  {isEdit ? 'Sửa chi tiết giao dịch của bạn.' : 'Thêm một giao dịch mới vào danh sách của bạn.'}
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className="px-6 grid gap-2">
               <FormField
                control={form.control}
                name="senderName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Nhập tên người gửi" {...field} autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="twdAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input 
                          type="number" 
                          placeholder="Số tiền người gửi (có thể âm)" 
                          {...field}
                          autoComplete="off"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="feeTwd"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div>
                        {showCustomFeeInput ? (
                          <Input
                            type="number"
                            placeholder="Phí gửi"
                             {...field}
                             onBlur={(e) => {
                               field.onBlur();
                               const feeValue = Number(e.target.value);
                               if (!isNaN(feeValue) && feeOptions.includes(feeValue)) {
                                 setShowCustomFeeInput(false);
                               }
                            }}
                            autoFocus
                            autoComplete="off"
                          />
                        ) : (
                          <Select
                            onValueChange={handleFeeChange}
                            value={String(field.value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn hoặc nhập phí" />
                            </SelectTrigger>
                            <SelectContent>
                              {feeOptions.map((fee) => (
                                <SelectItem key={fee} value={String(fee)}>
                                  {fee.toLocaleString()} TWD
                                </SelectItem>
                              ))}
                              <SelectItem value="other">Khác...</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter className="px-6 py-4">
              {isEdit && (
                <DialogClose asChild>
                  <Button type="button" variant="outline">Hủy</Button>
                </DialogClose>
              )}
              <Button type="submit">Lưu giao dịch</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default function CurrencyClarityApp() {
  const { exchangeRate, updateExchangeRate, isLoading: isRateLoading } = useExchangeRate();
  const { 
    transactions, 
    addTransaction, 
    editTransaction,
    deleteTransaction, 
    resetTransactions, 
    restoreLastDeleted,
    lastDeletedBatch,
    toggleTransactionTag,
    isLoading: isTransactionsLoading 
  } = useTransactions(undefined, exchangeRate);
  
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransactionId, setDeletingTransactionId] = useState<string | null>(null);
  const [isResetRevenueDialogOpen, setIsResetRevenueDialogOpen] = useState(false);
  const [isFeeVisible, setIsFeeVisible] = useState(true);
  const [testRate, setTestRate] = useState('');
  
  useEffect(() => {
    const storedVisibility = localStorage.getItem('feeVisibility_v1');
    if (storedVisibility !== null) {
      setIsFeeVisible(JSON.parse(storedVisibility));
    }
    const storedSelection = localStorage.getItem('selectedTransactions_v1');
    if (storedSelection) {
      try {
        const parsedSelection = JSON.parse(storedSelection);
        if (Array.isArray(parsedSelection)) {
          setSelectedTransactions(parsedSelection);
        }
      } catch (e) {
        console.error("Failed to parse selected transactions from storage", e);
        localStorage.removeItem('selectedTransactions_v1');
      }
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem('selectedTransactions_v1', JSON.stringify(selectedTransactions));
  }, [selectedTransactions]);

  useEffect(() => {
    if (!isTransactionsLoading) {
      const currentTransactionIds = new Set(transactions.map(t => t.id));
      setSelectedTransactions(prev => prev.filter(id => currentTransactionIds.has(id)));
    }
  }, [transactions, isTransactionsLoading]);
  
  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => {
      if (!a.timestamp || !b.timestamp) return 0;
      try {
        const dateA = parseISO(a.timestamp);
        const dateB = parseISO(b.timestamp);
        return dateB.getTime() - dateA.getTime();
      } catch (e) {
        return 0;
      }
    });
  }, [transactions]);
  
  const handleAddTransactionSubmit = (data: { senderName: string; twdAmount: number; feeTwd: number | undefined; }) => {
    const fee = data.feeTwd !== undefined && data.feeTwd > 0 ? data.feeTwd : 0;
    addTransaction({...data, feeTwd: fee});
  };
  
  const handleEditTransactionSubmit = (data: { senderName: string; twdAmount: number; feeTwd: number | undefined; }) => {
    if (!editingTransaction) return;
    const fee = data.feeTwd !== undefined && data.feeTwd > 0 ? data.feeTwd : 0;
    editTransaction(editingTransaction.id, {...data, feeTwd: fee}, editingTransaction.exchangeRate);
  };
  
  const openEditDialog = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteConfirm = () => {
    if (deletingTransactionId) {
      deleteTransaction([deletingTransactionId]);
      setDeletingTransactionId(null);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedTransactions.length > 0) {
      deleteTransaction(selectedTransactions);
      setSelectedTransactions([]);
    }
  };
  
  const handleResetConfirm = () => {
    resetTransactions();
    setSelectedTransactions([]);
    setIsResetRevenueDialogOpen(false);
  };
  
  const handleRestoreConfirm = () => {
    restoreLastDeleted();
  };

  const handleToggleFeeVisibility = () => {
    const newVisibility = !isFeeVisible;
    setIsFeeVisible(newVisibility);
    localStorage.setItem('feeVisibility_v1', JSON.stringify(newVisibility));
  };

  const overallTotals = useMemo(() => {
    const totals = sortedTransactions.reduce((acc, curr) => {
      acc.totalTwd += curr.twdAmount;
      acc.totalFeeTwd += curr.feeTwd;
      acc.totalVnd += curr.vndAmount;
      return acc;
    }, { totalTwd: 0, totalFeeTwd: 0, totalVnd: 0 });
    return totals;
  }, [sortedTransactions]);

  const selectedTotals = useMemo(() => {
    if (selectedTransactions.length === 0) {
        return { totalTwd: 0, totalVnd: 0 };
    }
    return sortedTransactions
    .filter(t => selectedTransactions.includes(t.id))
    .reduce((acc, curr) => {
        acc.totalTwd += curr.twdAmount;
        acc.totalVnd += curr.vndAmount;
        return acc;
    }, { totalTwd: 0, totalVnd: 0 });
  }, [selectedTransactions, sortedTransactions]);

  const calculatedTestVnd = useMemo(() => {
    const rate = parseFloat(testRate);
    if (!isNaN(rate) && rate > 0) {
        return selectedTotals.totalTwd * rate;
    }
    return null;
  }, [testRate, selectedTotals.totalTwd]);
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTransactions(sortedTransactions.map(t => t.id));
    } else {
      setSelectedTransactions([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedTransactions(prev => [...prev, id]);
    } else {
      setSelectedTransactions(prev => prev.filter(tId => tId !== id));
    }
  };

  if (isRateLoading || isTransactionsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const showRestoreButton = lastDeletedBatch.length > 0;
  const showDeleteSelectedButton = selectedTransactions.length > 0;
  const showResetButton = transactions.length > 0 && !showDeleteSelectedButton;

  return (
    <main className="min-h-screen flex justify-center pb-4 bg-background">
      <div className="container mx-auto px-2 pb-2 max-w-5xl">

        <div className="text-center py-0 my-0">
          <h1 className="text-2xl font-semibold tracking-wider text-muted-foreground/80 font-headline">NMHMIHI</h1>
        </div>

        <div className="mt-2">
          <ExchangeRateSetup rate={exchangeRate} onRateChange={updateExchangeRate} />
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mt-2">
            <div className="w-full md:w-1/3 flex flex-col gap-4">
              <Card className="shadow-sm">
                 <CardHeader className="flex flex-row items-center justify-between px-4 py-1">
                  <CardTitle className="flex items-center text-base font-headline text-foreground/80">
                    <Sigma className="mr-2 h-5 w-5" /> Tổng kết
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pt-1 pb-3">
                  <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-baseline">
                        <span className="text-muted-foreground">Tổng TWD:</span>
                        <span className="font-semibold text-base">{overallTotals.totalTwd.toLocaleString()} TWD</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-baseline">
                        <span className="text-muted-foreground">Tổng VND:</span>
                        <span className="font-semibold text-base text-primary">{overallTotals.totalVnd.toLocaleString()} VND</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Tổng Phí (TWD):</span>
                          <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={handleToggleFeeVisibility}>
                                {isFeeVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                <span className="sr-only">Ẩn/Hiện tổng phí</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{isFeeVisible ? 'Ẩn tổng phí' : 'Hiện tổng phí'}</p>
                            </TooltipContent>
                          </Tooltip>
                          </TooltipProvider>
                        </div>
                        <span className="font-semibold text-base">{isFeeVisible ? `${overallTotals.totalFeeTwd.toLocaleString()} TWD` : '********'}</span>
                      </div>
                  </div>

                  {selectedTransactions.length > 0 && (
                    <>
                      <Separator className="my-3" />
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-baseline">
                            <span className="text-muted-foreground">Tổng TWD Đã Chọn:</span>
                            <span className="font-semibold text-base text-accent-foreground">{selectedTotals.totalTwd.toLocaleString()} TWD</span>
                        </div>
                        <div className="flex justify-between items-baseline">
                            <span className="text-muted-foreground">Tổng VND Đã Chọn:</span>
                            <span className="font-semibold text-base text-primary">{selectedTotals.totalVnd.toLocaleString()} VND</span>
                        </div>
                      </div>

                      <Separator className="my-3" />
                      <div className="space-y-2 text-sm">
                          <label htmlFor="testRateInput" className="text-xs font-medium text-muted-foreground flex items-center">
                              <FlaskConical className="mr-2 h-4 w-4" /> Thử nghiệm trên mục đã chọn
                          </label>
                          <Input
                              id="testRateInput"
                              type="number"
                              placeholder="Nhập tỷ giá để thử nghiệm..."
                              value={testRate}
                              onChange={(e) => setTestRate(e.target.value)}
                              className="h-9"
                              autoComplete="off"
                          />
                          {calculatedTestVnd !== null && testRate.trim() !== '' && (
                            <>
                              <div className="flex justify-between items-baseline pt-1">
                                  <span className="text-muted-foreground">Kết quả (VND):</span>
                                  <span className="font-semibold text-base text-primary">
                                      {calculatedTestVnd.toLocaleString()}
                                  </span>
                              </div>
                              <div className="flex justify-between items-baseline pt-1">
                                <span className="text-muted-foreground">Chênh lệch:</span>
                                <span className={cn(
                                  "font-semibold text-base",
                                  (calculatedTestVnd - selectedTotals.totalVnd) < 0 ? "text-destructive" : "text-primary"
                                )}>
                                    {(calculatedTestVnd - selectedTotals.totalVnd).toLocaleString()}
                                </span>
                              </div>
                            </>
                          )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
            <div className="w-full md:w-2/3">
              <Card className="shadow-sm h-full">
                <CardHeader className="flex flex-row items-center justify-between px-4 py-1">
                  <CardTitle className="flex items-center text-base font-headline text-foreground/80">
                    <TrendingUp className="mr-2 h-5 w-5" /> Danh sách giao dịch
                  </CardTitle>
                   <Button onClick={() => setIsAddDialogOpen(true)} size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" /> Thêm mới
                  </Button>
                </CardHeader>
                <CardContent className="px-4 pt-1 pb-4">
                  {sortedTransactions.length > 0 ? (
                      <TooltipProvider>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="px-2 py-2 w-[1%]">
                                <Checkbox
                                    checked={sortedTransactions.length > 0 && selectedTransactions.length === sortedTransactions.length}
                                    onCheckedChange={handleSelectAll}
                                    aria-label="Chọn tất cả"
                                  />
                              </TableHead>
                              <TableHead className="px-2 py-2">Người gửi</TableHead>
                              <TableHead className="text-right px-2 py-2">TWD</TableHead>
                              <TableHead className="text-right px-2 py-2">VND</TableHead>
                              <TableHead className="text-right px-2 py-2">Phí</TableHead>
                              <TableHead className="text-right px-2 py-2">Tỷ giá</TableHead>
                              <TableHead className="px-2 py-2">Thời gian</TableHead>
                              <TableHead className="text-right px-1 py-2 w-[1%] whitespace-nowrap">Hành động</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sortedTransactions.map(t => (
                              <TableRow 
                                key={t.id} 
                                data-state={selectedTransactions.includes(t.id) ? "selected" : ""}
                                className={cn(
                                  "transition-colors",
                                  t.tag === 'other' ? 'bg-destructive/10 hover:bg-destructive/20 data-[state=selected]:bg-destructive/20' : 'hover:bg-muted/50 data-[state=selected]:bg-muted'
                                )}
                              >
                                <TableCell className="px-2 py-1">
                                    <Checkbox
                                      checked={selectedTransactions.includes(t.id)}
                                      onCheckedChange={(checked) => handleSelectOne(t.id, !!checked)}
                                      aria-label="Chọn giao dịch"
                                    />
                                </TableCell>
                                <TableCell className="font-medium px-2 py-1">{t.senderName}</TableCell>
                                <TableCell className={cn("text-right px-2 py-1", t.twdAmount < 0 && "text-destructive")}>{t.twdAmount.toLocaleString()}</TableCell>
                                <TableCell className={cn("text-right font-semibold px-2 py-1", t.vndAmount < 0 ? "text-destructive" : "text-primary")}>{t.vndAmount.toLocaleString()}</TableCell>
                                <TableCell className="text-right px-2 py-1">{t.feeTwd.toLocaleString()}</TableCell>
                                <TableCell className="text-right px-2 py-1">{t.exchangeRate.toLocaleString()}</TableCell>
                                <TableCell className="px-2 py-1">{t.timestamp ? format(parseISO(t.timestamp), 'dd/MM/yy HH:mm') : ''}</TableCell>
                                <TableCell className="text-right space-x-0 px-1 py-1">
                                  <Tooltip>
                                      <TooltipTrigger asChild>
                                          <Button variant="ghost" onClick={() => toggleTransactionTag(t.id)} aria-label="Đánh dấu" className="p-2 h-8 w-8">
                                            <UserCheck className={cn("h-4 w-4", t.tag === 'other' ? 'text-accent-foreground' : 'text-muted-foreground')} />
                                          </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                          <p>{t.tag === 'other' ? 'Đánh dấu là chuyển hộ' : 'Đánh dấu là của bạn'}</p>
                                      </TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                      <TooltipTrigger asChild>
                                          <Button variant="ghost" onClick={() => openEditDialog(t)} aria-label="Sửa" className="p-2 h-8 w-8">
                                            <Edit3 className="h-4 w-4" />
                                          </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                          <p>Sửa giao dịch</p>
                                      </TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                      <TooltipTrigger asChild>
                                          <Button variant="ghost" onClick={() => setDeletingTransactionId(t.id)} aria-label="Xóa" className="p-2 h-8 w-8">
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                          </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                          <p>Xóa giao dịch</p>
                                      </TooltipContent>
                                  </Tooltip>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      </TooltipProvider>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">Chưa có giao dịch nào!</p>
                  )}
                </CardContent>
              </Card>
            </div>
        </div>
        
        <div className="mt-4">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between px-4 py-1">
              <CardTitle className="flex items-center text-base font-headline text-foreground/80">
                <Settings className="mr-2 h-5 w-5" /> Quản lý dữ liệu
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 px-4 pt-3 pb-4">
                {showRestoreButton && (
                    <Button onClick={handleRestoreConfirm} variant="outline" className="w-full">
                      <History className="mr-2 h-5 w-5" /> Khôi phục {lastDeletedBatch.length} giao dịch
                    </Button>
                )}
                {showDeleteSelectedButton && (
                   <Button onClick={handleDeleteSelected} variant="destructive" className="w-full">
                      <Trash2 className="mr-2 h-5 w-5" /> Xóa {selectedTransactions.length} giao dịch đã chọn
                    </Button>
                )}
                {showResetButton && (
                    <Button onClick={() => setIsResetRevenueDialogOpen(true)} variant="destructive" className="w-full">
                      <RotateCcw className="mr-2 h-5 w-5" /> Reset Tất Cả
                    </Button>
                )}
                {!showRestoreButton && !showDeleteSelectedButton && !showResetButton && (
                    <p className="text-sm text-center text-muted-foreground py-2 w-full">Không có hành động nào.</p>
                )}
            </CardContent>
          </Card>
        </div>
        
        <footer className="text-center py-8 text-sm text-muted-foreground">
          <span suppressHydrationWarning>© {new Date().getFullYear()}</span> bản quyền thuộc về nmhmihi Minh Hiển
        </footer>

        {isAddDialogOpen && (
          <TransactionDialog
            key="add-transaction"
            isOpen={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            onSubmit={handleAddTransactionSubmit}
            defaultValues={{ feeTwd: 100 }}
            isEdit={false}
          />
        )}

        {editingTransaction && isEditDialogOpen && (
          <TransactionDialog
            key={editingTransaction.id}
            isOpen={isEditDialogOpen}
            onOpenChange={(open) => {
              if (!open) {
                setEditingTransaction(null);
              }
              setIsEditDialogOpen(open);
            }}
            onSubmit={handleEditTransactionSubmit}
            defaultValues={{
              senderName: editingTransaction.senderName,
              twdAmount: editingTransaction.twdAmount,
              feeTwd: editingTransaction.feeTwd,
            }}
            isEdit={true}
          />
        )}
        
        <Dialog open={!!deletingTransactionId} onOpenChange={(open) => {if(!open) setDeletingTransactionId(null)}}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận xóa</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn xóa giao dịch này không?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeletingTransactionId(null)}>Hủy</Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>Xóa</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isResetRevenueDialogOpen} onOpenChange={setIsResetRevenueDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận Reset Toàn Bộ Giao Dịch</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn xóa TOÀN BỘ các giao dịch không? Dữ liệu đã xóa có thể được khôi phục sau đó.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsResetRevenueDialogOpen(false)}>Hủy</Button>
              <Button variant="destructive" onClick={handleResetConfirm}>Xác nhận Reset</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
