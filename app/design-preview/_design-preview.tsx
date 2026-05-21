"use client";

/**
 * Phase 0.5 visual QA harness. Replaced by /(public)/landing in Phase 2.
 * Renders one instance of every primitive against a theme toggle so you can
 * eyeball light/dark parity without deploying.
 */

import { Bell, Heart, Moon, ShoppingCart, Sun } from "lucide-react";
import { useState } from "react";

import { StatusBadge, VerifiedBadge } from "@/components/badges";
import { Logo } from "@/components/brand";
import { FilterChip, Pagination, SearchInput } from "@/components/data";
import { EmptyState, ErrorState, LoadingButton, Spinner } from "@/components/feedback";
import { Inline, Page, PageHeader, Section, Stack } from "@/components/layout";
import { Money, RelativeTime } from "@/components/locale";
import { UserAvatar } from "@/components/media";
import { useTheme } from "@/components/theme";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FormField, FormFieldControl } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/sonner";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

export function DesignPreview() {
  const { resolvedTheme, setTheme } = useTheme();
  const [page, setPage] = useState(3);

  return (
    <Page>
      <PageHeader
        eyebrow="Phase 0.5"
        title={<Logo variant="full" size="lg" />}
        description="Design-system harness: every primitive rendered against the live tokens. Toggle the theme to verify dark-mode parity."
        actions={
          <Button
            variant="outline"
            size="md"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          >
            {resolvedTheme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            {resolvedTheme === "dark" ? "Light" : "Dark"}
          </Button>
        }
      />

      <Section>
        <h2 className="text-h3 font-semibold">Buttons</h2>
        <Inline gap={3} wrap>
          <Button variant="primary">Добавить в корзину</Button>
          <Button variant="secondary">Поиск по карте</Button>
          <Button variant="outline">Фильтры</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Удалить</Button>
          <Button variant="danger-soft">Сбросить фильтры</Button>
          <Button variant="link">link</Button>
          <Button size="icon" variant="secondary">
            <Heart />
          </Button>
          <LoadingButton pending pendingLabel="Регистрируем…">
            Регистрация
          </LoadingButton>
        </Inline>
      </Section>

      <Section>
        <h2 className="text-h3 font-semibold">Inputs &amp; form field</h2>
        <div className="grid max-w-2xl grid-cols-1 gap-4 md:grid-cols-2">
          <FormField label="Имя" required>
            <FormFieldControl>
              <Input placeholder="Имя" />
            </FormFieldControl>
          </FormField>
          <FormField label="Email" error="Введите корректный email">
            <FormFieldControl>
              <Input type="email" defaultValue="not-an-email" />
            </FormFieldControl>
          </FormField>
          <FormField label="О компании" description="Кратко о деятельности">
            <FormFieldControl>
              <Textarea placeholder="Описание" />
            </FormFieldControl>
          </FormField>
          <FormField label="Регион">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Все регионы" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tashkent">Ташкент</SelectItem>
                <SelectItem value="samarkand">Самарканд</SelectItem>
                <SelectItem value="bukhara">Бухара</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>
        <Inline gap={6} wrap>
          <span className="inline-flex items-center gap-2 text-body-sm">
            <Checkbox id="preview-stock" defaultChecked />
            <label htmlFor="preview-stock">Только в наличии</label>
          </span>
          <span className="inline-flex items-center gap-2 text-body-sm">
            <Switch id="preview-verified" defaultChecked />
            <label htmlFor="preview-verified">Верифицированные продавцы</label>
          </span>
          <RadioGroup defaultValue="buyer" className="flex gap-4">
            <span className="inline-flex items-center gap-2 text-body-sm">
              <RadioGroupItem id="preview-role-buyer" value="buyer" />
              <label htmlFor="preview-role-buyer">Покупатель</label>
            </span>
            <span className="inline-flex items-center gap-2 text-body-sm">
              <RadioGroupItem id="preview-role-seller" value="seller" />
              <label htmlFor="preview-role-seller">Продавец</label>
            </span>
          </RadioGroup>
        </Inline>
      </Section>

      <Section>
        <h2 className="text-h3 font-semibold">Search, chips, pagination</h2>
        <SearchInput onSearchChange={() => {}} placeholder="Поиск товара" />
        <Inline gap={2} wrap>
          <FilterChip active>Все категории</FilterChip>
          <FilterChip>Материалы</FilterChip>
          <FilterChip>Текстиль</FilterChip>
          <FilterChip onRemove={() => toast.success("Удалили фильтр")} removeLabel="Убрать">
            Ташкент
          </FilterChip>
        </Inline>
        <Pagination
          paginator={{ kind: "manual", page, perPage: 10, totalItems: 200 }}
          onPageChange={setPage}
        />
      </Section>

      <Section>
        <h2 className="text-h3 font-semibold">Cards, badges, avatars, money</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <Inline justify="between">
                <CardTitle>Листовая сталь 3мм</CardTitle>
                <VerifiedBadge label="Verified" />
              </Inline>
              <CardDescription>Metal Trade LLC</CardDescription>
            </CardHeader>
            <CardContent>
              <Inline justify="between">
                <span className="text-body-sm text-fg-muted">от</span>
                <Money amount={520} currency="USD" maximumFractionDigits={0} />
              </Inline>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Статусы</CardTitle>
              <CardDescription>Backend enums</CardDescription>
            </CardHeader>
            <CardContent>
              <Inline gap={2} wrap>
                <StatusBadge kind="lead" status="NEW" label="Новый" />
                <StatusBadge kind="product" status="APPROVED" label="Опубликован" />
                <StatusBadge kind="verification" status="PENDING_VERIFICATION" label="На проверке" />
                <StatusBadge kind="report" status="REJECTED" label="Отклонена" />
                <Badge variant="info">Info</Badge>
                <Badge variant="warning">Warning</Badge>
              </Inline>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Профиль</CardTitle>
              <CardDescription>Аватар + относительное время</CardDescription>
            </CardHeader>
            <CardContent>
              <Inline gap={3}>
                <UserAvatar name="John Doe" size="lg" />
                <Stack gap={0}>
                  <span className="font-medium">John Doe</span>
                  <span className="text-body-sm text-fg-muted">
                    Регистрация <RelativeTime value={new Date(Date.now() - 86_400_000 * 3)} />
                  </span>
                </Stack>
              </Inline>
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section>
        <h2 className="text-h3 font-semibold">Tabs, dialog, toasts</h2>
        <Tabs defaultValue="overview" className="max-w-2xl">
          <TabsList>
            <TabsTrigger value="overview">Описание</TabsTrigger>
            <TabsTrigger value="specs">Характеристики</TabsTrigger>
            <TabsTrigger value="delivery">Доставка</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <p className="text-body text-fg-muted">
              Горячекатаный стальной лист толщиной 3мм. Соответствует ГОСТ 19903-2015.
            </p>
          </TabsContent>
          <TabsContent value="specs">
            <p className="text-body text-fg-muted">Материал · Размеры · Вес · Цвет</p>
          </TabsContent>
          <TabsContent value="delivery">
            <p className="text-body text-fg-muted">Условия доставки уточните у продавца.</p>
          </TabsContent>
        </Tabs>
        <Inline gap={2}>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary">Open dialog</Button>
            </DialogTrigger>
            <DialogContent closeLabel="Закрыть">
              <DialogHeader>
                <DialogTitle>Подтвердите действие</DialogTitle>
                <DialogDescription>
                  Это пример диалога с трапом фокуса и закрытием по Escape.
                </DialogDescription>
              </DialogHeader>
              <Inline justify="end" gap={2}>
                <Button variant="ghost">Отмена</Button>
                <Button variant="primary">Подтвердить</Button>
              </Inline>
            </DialogContent>
          </Dialog>
          <Button variant="ghost" onClick={() => toast.success("Сохранили!")}>
            Toast: success
          </Button>
          <Button variant="ghost" onClick={() => toast.error("Что-то пошло не так")}>
            Toast: error
          </Button>
        </Inline>
      </Section>

      <Section>
        <h2 className="text-h3 font-semibold">Five states</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Card>
            <CardContent className="flex items-center justify-center pt-6">
              <Spinner label="Загружаем…" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-2 pt-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton variant="text" className="w-2/3" />
              <Skeleton variant="text" className="w-1/3" />
            </CardContent>
          </Card>
          <EmptyState
            title="Здесь пока ничего нет"
            description="Как только данные появятся, вы увидите их здесь."
            action={<Button variant="secondary">Обновить</Button>}
          />
          <ErrorState
            title="Не удалось загрузить данные"
            description="Попробуйте повторить запрос."
            correlationId="abc-123-def"
            correlationIdLabel="Код обращения:"
            action={<Button variant="outline">Повторить</Button>}
          />
        </div>
      </Section>

      <Section>
        <h2 className="text-h3 font-semibold">Topbar mock</h2>
        <Card className="p-4">
          <Inline justify="between">
            <Logo variant="wordmark" label="Sklad Market" size="md" />
            <Inline gap={3}>
              <Button variant="ghost" size="icon" aria-label="Уведомления">
                <Bell />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Избранное">
                <Heart />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Корзина">
                <ShoppingCart />
              </Button>
              <UserAvatar name="John Doe" size="sm" />
            </Inline>
          </Inline>
        </Card>
      </Section>
    </Page>
  );
}
