import { useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut, Settings, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Avatar } from '../ui/avatar'
import { cn } from '../../lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '../ui/dropdown-menu'

// Di bawah lg menu ini hanya tampil di bilah atas (compact). Kalau tetap di kepala
// halaman, kartunya terdorong keluar layar pada halaman yang tombolnya banyak dan
// mengambil satu baris sendiri pada halaman lain.
export function UserAccountMenu({ compact = false }) {
  const { user, roleInfo, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className={compact ? 'flex' : 'hidden lg:flex'}>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <button
            type="button"
            className={cn(
              'flex cursor-pointer items-center rounded-full border border-slate-200 bg-white text-left shadow-sm transition-colors hover:bg-slate-50 active:scale-[0.98]',
              compact ? 'gap-1 p-1 pr-2' : 'gap-3 px-3 py-2'
            )}
            aria-label="Buka menu profil"
          >
            <Avatar name={user?.name} size="sm" />
            {!compact && (
              <div>
                <p className="text-sm font-semibold text-[#233b84]">{user?.name || 'Pengguna'}</p>
                <p className="text-xs text-[#61739b]">{roleInfo.label}</p>
              </div>
            )}
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => navigate('/profile')}>
            <User className="h-4 w-4" /> Profil
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/profile')}>
            <Settings className="h-4 w-4" /> Pengaturan
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              logout()
              navigate('/')
            }}
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="h-4 w-4" /> Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
