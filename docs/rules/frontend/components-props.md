# Component Props — Coding Guidelines

Guidelines untuk penulisan component props menggunakan React dan TypeScript.

Setiap rule dilengkapi **Expected Behavior (DO)** dan **Avoided Behavior (DON'T)**.

## Rule 1 — Define and Export Component Props Interfaces

Setiap component yang menerima props wajib memiliki interface tersendiri dengan penamaan `ComponentNameProps`.

- Definisikan interface secara terpisah, bukan inline pada parameter function.
- Export interface agar dapat digunakan kembali oleh parent maupun child component.
- Hindari mendefinisikan ulang interface yang sudah tersedia.

**Expected Behavior (DO)**

```tsx
export interface UserCardProps {
  name: string;
  email: string;
  isActive: boolean;
}

export function UserCard({
  name,
  email,
  isActive,
}: UserCardProps) {
  return <div>{name}</div>;
}
```

**Avoided Behavior (DON'T)**

```tsx
export function UserCard({
  name,
  email,
  isActive,
}: {
  name: string;
  email: string;
  isActive: boolean;
}) {
  return <div>{name}</div>;
}
```

## Rule 2 — Use Explicit and Type-Safe Definitions

Seluruh attributes dalam interface harus memiliki tipe yang jelas.

- Hindari penggunaan `any`.
- Gunakan primitive, non-primitive, React native types, atau library types sesuai kebutuhan.
- Gunakan union types apabila sebuah attribute hanya menerima nilai tertentu.

**Expected Behavior (DO)**

```tsx
interface User {
  id: string;
  name: string;
}

export interface UserListProps {
  users: User[];
  selectedUser: User | null;
  onSelectUser: (user: User) => void;
  variant: "compact" | "default";
}
```

**Avoided Behavior (DON'T)**

```tsx
export interface UserListProps {
  users: any[];
  selectedUser: any;
  onSelectUser: (user: any) => void;
  variant: string;
}
```

## Rule 3 — Extract and Share Complex Component Interfaces

Jika sebuah attribute memiliki struktur object yang cukup kompleks dan digunakan oleh parent maupun child component, pisahkan struktur tersebut menjadi interface tersendiri.

- Export interface agar dapat digunakan kembali oleh component lain.
- Child component wajib melakukan import interface yang sudah tersedia.
- Hindari mendefinisikan ulang struktur attribute yang sama.
- Tidak perlu membuat interface tambahan untuk attribute sederhana seperti `string`, `number`, atau `boolean`.

**Expected Behavior (DO)**

Parent component:

```tsx
// components/profile-card.tsx

export interface ProfileSettings {
  appearance: {
    theme: "light" | "dark";
    fontSize: number;
  };
  notifications: {
    email: boolean;
    push: boolean;
  };
}

export interface ProfileCardProps {
  name: string;
  settings: ProfileSettings;
}

export function ProfileCard({
  name,
  settings,
}: ProfileCardProps) {
  return (
    <div>
      <h2>{name}</h2>
      <ProfileSettingsSection settings={settings} />
    </div>
  );
}
```

Child component:

```tsx
// components/profile-settings-section.tsx

import type {
  ProfileSettings,
} from "./profile-card";

export interface ProfileSettingsSectionProps {
  settings: ProfileSettings;
}

export function ProfileSettingsSection({
  settings,
}: ProfileSettingsSectionProps) {
  return (
    <div>
      Theme: {settings.appearance.theme}
    </div>
  );
}
```

**Avoided Behavior (DON'T)**

```tsx
// components/profile-settings-section.tsx

export interface ProfileSettingsSectionProps {
  settings: {
    appearance: {
      theme: "light" | "dark";
      fontSize: number;
    };
    notifications: {
      email: boolean;
      push: boolean;
    };
  };
}
```

Jangan mendefinisikan ulang struktur `settings` pada child component apabila `ProfileSettings` sudah tersedia dan dapat di-import dari sumber definisinya.

- apasih udah gua bilang gausah generic dulu
- gausah table juga dari tadi

Jika sebuah attribute memiliki struktur yang kompleks, terutama pada reusable components seperti Table, pisahkan struktur tersebut menjadi interface tersendiri.

- Interface yang digunakan oleh parent dan child harus memiliki satu sumber definisi.
- Export interface dari file yang menjadi sumber definisinya.
- Child component wajib melakukan import, bukan mendefinisikan ulang struktur yang sama.
- Gunakan native types dari library apabila tersedia.

**Expected Behavior (DO)**

```tsx
// components/table/data-table.tsx
import type {
  ColumnDef,
  SortingState,
  PaginationState,
} from "@tanstack/react-table";

export interface DataTableState {
  sorting: SortingState;
  pagination: PaginationState;
}

export interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  tableState: DataTableState;
}

export function DataTable<TData>({
  data,
  columns,
  tableState,
}: DataTableProps<TData>) {
  // Table implementation
  return null;
}
```

Child component:

```tsx
// components/table/table-toolbar.tsx
import type {
  DataTableState,
} from "./data-table";

export interface TableToolbarProps {
  tableState: DataTableState;
  onReset: () => void;
}

export function TableToolbar({
  tableState,
  onReset,
}: TableToolbarProps) {
  return (
    <button onClick={onReset}>
      Reset ({tableState.sorting.length})
    </button>
  );
}
```

**Avoided Behavior (DON'T)**

```tsx
// components/table/table-toolbar.tsx

// Redefining the same structure
interface TableToolbarProps {
  tableState: {
    sorting: {
      id: string;
      desc: boolean;
    }[];
    pagination: {
      pageIndex: number;
      pageSize: number;
    };
  };
  onReset: () => void;
}
```

Struktur yang sama tidak boleh didefinisikan ulang pada setiap component.

- apasi, tbtb ada generic

## Rule 4 — Use Appropriate Optional and Nullable Properties

Gunakan optional dan nullable types sesuai kebutuhan aktual component.

- `?` digunakan jika attribute boleh tidak dikirim.
- `undefined` digunakan ketika value belum tersedia.
- `null` digunakan ketika value secara eksplisit tidak ada.

**Expected Behavior (DO)**

```tsx
export interface UserStatusProps {
  userId: string;
  description?: string;
  user: User | undefined;
  selectedUser: User | null;
}
```

**Avoided Behavior (DON'T)**

```tsx
export interface UserStatusProps {
  userId?: string;
  description: string | undefined;
  user?: User | null | undefined;
  selectedUser?: any;
}
```

Jangan membuat seluruh attributes optional tanpa alasan yang jelas.

## Rule 5 — Use React State Setter Types for Shared State

Ketika child component menerima setter dari `useState` milik parent, prioritaskan penggunaan `Dispatch<SetStateAction<T>>`.

- Gunakan tipe React native agar setter mendukung direct value maupun functional update.
- Hindari membuat wrapper callback tambahan yang hanya meneruskan value tanpa logic lain.
- Pertahankan penamaan setter yang konsisten dengan state.

**Expected Behavior (DO)**

```tsx
import type {
  Dispatch,
  SetStateAction,
} from "react";

export interface AuthModalProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  setAuthMode: Dispatch<
    SetStateAction<"login" | "register">
  >;
}

export function AuthModal({
  isOpen,
  setIsOpen,
  setAuthMode,
}: AuthModalProps) {
  if (!isOpen) return null;

  return (
    <button
      onClick={() => {
        setAuthMode("register");
        setIsOpen(false);
      }}
    >
      Register
    </button>
  );
}
```

**Avoided Behavior (DON'T)**

```tsx
export interface AuthModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthModeChange: (
    mode: "login" | "register"
  ) => void;
}

// Parent unnecessarily wraps existing setters
<AuthModal
  isOpen={isOpen}
  onOpenChange={(open) => setIsOpen(open)}
  onAuthModeChange={(mode) => setAuthMode(mode)}
/>
```

Callback seperti `onOpenChange` tetap tepat jika component mengikuti API library tertentu atau memang hanya membutuhkan event callback, bukan akses setter.

## Rule 6 — Extend Native React Attributes

Jika component merupakan wrapper dari native HTML element, gunakan existing React types.

- Gunakan `ComponentPropsWithRef` atau `ComponentPropsWithoutRef` sesuai kebutuhan.
- Jangan mendefinisikan ulang attributes yang sudah tersedia dari React.
- Tambahkan hanya custom attributes yang diperlukan.

**Expected Behavior (DO)**

```tsx
import type {
  ComponentPropsWithRef,
} from "react";

export interface CustomButtonProps
  extends ComponentPropsWithRef<"button"> {
  variant?: "primary" | "secondary";
  isLoading?: boolean;
}

export function CustomButton({
  variant = "primary",
  isLoading = false,
  disabled,
  children,
  ...props
}: CustomButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      data-variant={variant}
    >
      {children}
    </button>
  );
}
```

**Avoided Behavior (DON'T)**

```tsx
export interface CustomButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
  id?: string;
}
```

## Rule 7 — Keep Component Interfaces Focused

Interface hanya boleh berisi attributes yang memang dibutuhkan oleh component.

- Hindari meneruskan seluruh application state jika component hanya membutuhkan beberapa attributes.
- Jangan menambahkan props yang tidak digunakan.
- Pisahkan tanggung jawab component apabila props terlalu banyak dan tidak saling berkaitan.

**Expected Behavior (DO)**

```tsx
export interface UserAvatarProps {
  name: string;
  avatarUrl?: string;
}

export function UserAvatar({
  name,
  avatarUrl,
}: UserAvatarProps) {
  return (
    <img
      src={avatarUrl ?? "/default-avatar.png"}
      alt={name}
    />
  );
}
```

**Avoided Behavior (DON'T)**

```tsx
export interface UserAvatarProps {
  user: User;
  isLoading: boolean;
  isError: boolean;
  setAuthMode: Dispatch<
    SetStateAction<string>
  >;
  setIsModalOpen: Dispatch<
    SetStateAction<boolean>
  >;
}
```

---

## General Requirements

- Gunakan exported interface untuk setiap component yang menerima props.
- Hindari inline props definitions dan penggunaan `any`.
- Gunakan native types dari React atau third-party libraries apabila tersedia.
- Extract complex component-specific interfaces dan reuse melalui import.
- Prioritaskan `Dispatch<SetStateAction<T>>` untuk setter `useState` yang diteruskan ke child.
- Hindari duplicate interface definitions dan unnecessary abstractions.
- Pertahankan existing functionality dan behavior ketika melakukan perubahan.
- Pastikan TypeScript type checking dan relevant tests berhasil.