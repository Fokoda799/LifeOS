"use client";

import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const rows = [
  { date: "Nov 14", description: "Carrefour Market", category: "Food", amount: -185.45 },
  { date: "Nov 12", description: "Salary", category: "Income", amount: 8650 },
  { date: "Nov 10", description: "CTM Bus", category: "Transport", amount: -80 },
];

const amount = new Intl.NumberFormat("en", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: "always",
});

export function ComponentsDemo() {
  return (
    <section className="space-y-6">
      <h2 className="text-xl font-semibold">Components</h2>

      <div className="flex flex-wrap items-center gap-3">
        <Button>Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Delete</Button>
        <Button disabled>Disabled</Button>
        <Button variant="outline" onClick={() => toast.success("Transaction saved")}>
          Show toast
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>New transaction</CardTitle>
            <CardDescription>Card, label and input together.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label htmlFor="amount">Amount (MAD)</Label>
            <Input id="amount" inputMode="decimal" placeholder="0.00" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dialog</CardTitle>
            <CardDescription>Focus stays inside it, and Esc closes it.</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger className={buttonVariants({ variant: "outline" })}>
                Open dialog
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete transaction?</DialogTitle>
                  <DialogDescription>This cannot be undone.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose className={buttonVariants({ variant: "outline" })}>
                    Cancel
                  </DialogClose>
                  <Button variant="destructive" onClick={() => toast.error("Deleted")}>
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-end">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.description}>
                  <TableCell className="text-muted-foreground">{r.date}</TableCell>
                  <TableCell>{r.description}</TableCell>
                  <TableCell>{r.category}</TableCell>
                  <TableCell
                    className={`text-end tabular-nums ${r.amount < 0 ? "text-expense" : "text-income"}`}
                  >
                    <bdi dir="ltr"> {amount.format(r.amount)} MAD</bdi>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </section>
  );
}
