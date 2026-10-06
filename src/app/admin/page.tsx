'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  TicketOrder, 
  OrderItem, 
  QuoteStatus, 
  STATUS_MAP, 
  PLATFORM_CONFIG,
  ShippingModeType,
  GroupBuyItem,
  GroupBuyParticipant,
  GroupBuyStatus
} from '@/lib/types';
import { AppSettings, PaymentAccount, StorePlatform } from '@/lib/settings';
import { 
  ShieldCheck, 
  Lock, 
  Search, 
  Edit3, 
  ExternalLink, 
  Save, 
  X, 
  CheckCircle2, 
  Clock, 
  ShoppingBag, 
  MessageCircle, 
  DollarSign, 
  Trash2, 
  AlertCircle,
  Eye,
  RefreshCw,
  Plus,
  Plane,
  Ship,
  CreditCard,
  Settings,
  Layers,
  ToggleLeft,
  ToggleRight,
  Users,
  Calendar,
  TrendingUp,
  Percent,
  Sparkles,
  Phone,
  Link2,
  Send,
  Bot,
  Radio,
  Terminal,
  BarChart3,
  Target,
  Share2,
  Copy,
  Check,
  MousePointerClick,
  Globe,
  Crown,
  Key,
  XCircle,
  Camera,
  Star,
  MapPin,
  ThumbsUp,
  Upload
} from 'lucide-react';
import { AnalyticsSummary, AnalyticsEvent } from '@/lib/analytics';
import { useSettings } from '@/context/SettingsContext';
import FeexPayRenewalModal from '@/components/FeexPayRenewalModal';
import { setClientAuth } from '@/lib/authClient';
import { DeliveredOrder } from '@/lib/deliveredOrdersData';

export default function AdminPage() {
  const { refreshSettings } = useSettings();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isMobileMode, setIsMobileMode] = useState(false);

  // Données Tickets
  const [tickets, setTickets] = useState<TicketOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeAdminTab, setActiveAdminTab] = useState<'tickets' | 'group_buys' | 'delivered_orders' | 'platforms' | 'settings' | 'telegram' | 'marketing'>('tickets');

  // Données Marketing & Statistiques
  const [analyticsSummary, setAnalyticsSummary] = useState<AnalyticsSummary | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [marketingSubTab, setMarketingSubTab] = useState<'overview' | 'pixels' | 'utm'>('overview');
  const [marketingSuccess, setMarketingSuccess] = useState(false);

  // Générateur UTM
  const [utmTargetPage, setUtmTargetPage] = useState('/');
  const [utmSource, setUtmSource] = useState('facebook');
  const [utmMedium, setUtmMedium] = useState('ads');
  const [utmCampaign, setUtmCampaign] = useState('promo-shein-benin');
  const [copiedUtm, setCopiedUtm] = useState(false);

  // État Abonnement Mensuel & FeexPay
  const [subscriptionInfo, setSubscriptionInfo] = useState<{
    isExpired: boolean;
    expiresAt: string;
    daysRemaining: number;
    monthlyFeeCFA: number;
    subscriptionDurationDays?: number;
    isSuperAdmin?: boolean;
    feexpayMode?: string;
  } | null>(null);
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [renewalPhone, setRenewalPhone] = useState('0154072488');
  const [renewalOperator, setRenewalOperator] = useState('MTN');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState<{
    newPassword: string;
    expiresAt: string;
  } | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [waitingForMobilePin, setWaitingForMobilePin] = useState(false);
  const [pendingPaymentRef, setPendingPaymentRef] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | undefined>(undefined);

  // État Test Telegram
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [telegramTestResult, setTelegramTestResult] = useState<{
    success: boolean;
    message: string;
    botName?: string;
    botUsername?: string;
  } | null>(null);

  // Ventes en Groupe
  const [groupBuys, setGroupBuys] = useState<GroupBuyItem[]>([]);
  const [loadingGb, setLoadingGb] = useState(false);
  const [showGbModal, setShowGbModal] = useState(false);
  const [editingGb, setEditingGb] = useState<GroupBuyItem | null>(null);
  const [viewingParticipantsGb, setViewingParticipantsGb] = useState<GroupBuyItem | null>(null);

  // Formulaire Vente en Groupe
  const [gbTitle, setGbTitle] = useState('');
  const [gbDescription, setGbDescription] = useState('');
  const [gbImageUrl, setGbImageUrl] = useState('');
  const [gbPriceCFA, setGbPriceCFA] = useState<number | ''>('');
  const [gbOriginalPriceCFA, setGbOriginalPriceCFA] = useState<number | ''>('');
  const [gbMinQty, setGbMinQty] = useState<number>(10);
  const [gbOrderDate, setGbOrderDate] = useState('');
  const [gbShippingMode, setGbShippingMode] = useState<ShippingModeType>('air');
  const [gbPlatform, setGbPlatform] = useState('shein');
  const [gbVariants, setGbVariants] = useState('');
  const [gbStatus, setGbStatus] = useState<GroupBuyStatus>('open');
  const [gbError, setGbError] = useState<string | null>(null);
  const [gbSuccess, setGbSuccess] = useState(false);

  // Colis Reçus & Preuves Clients (Carrousel Suivi)
  const [deliveredOrders, setDeliveredOrders] = useState<DeliveredOrder[]>([]);
  const [loadingDeliveredOrders, setLoadingDeliveredOrders] = useState(false);
  const [showDeliveredModal, setShowDeliveredModal] = useState(false);
  const [editingDeliveredOrder, setEditingDeliveredOrder] = useState<DeliveredOrder | null>(null);
  const [delSaving, setDelSaving] = useState(false);
  const [delError, setDelError] = useState<string | null>(null);
  const [delSuccess, setDelSuccess] = useState<string | null>(null);
  const [deliveredFilter, setDeliveredFilter] = useState<'all' | 'air' | 'sea' | 'shein' | 'temu' | 'alibaba'>('all');
  const [deliveredSearch, setDeliveredSearch] = useState('');

  // Formulaire Colis Reçu
  const [delClientName, setDelClientName] = useState('');
  const [delLocation, setDelLocation] = useState('Cotonou (Akpakpa)');
  const [delTicketId, setDelTicketId] = useState('');
  const [delPlatform, setDelPlatform] = useState<'Shein' | 'Temu' | 'Alibaba' | 'Autre'>('Shein');
  const [delShippingMode, setDelShippingMode] = useState<'air' | 'sea'>('air');
  const [delTransitDays, setDelTransitDays] = useState<number>(18);
  const [delDeliveryDate, setDelDeliveryDate] = useState('Reçu il y a 3 jours');
  const [delTitle, setDelTitle] = useState('');
  const [delItemsSummary, setDelItemsSummary] = useState('');
  const [delRating, setDelRating] = useState<number>(5);
  const [delReview, setDelReview] = useState('');
  const [delImageUrl, setDelImageUrl] = useState('');
  const [delVerified, setDelVerified] = useState<boolean>(true);

  // Paramètres & Plateformes
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Formulaire d'ajout de nouvelle plateforme
  const [newPlatformName, setNewPlatformName] = useState('');
  const [newPlatformBadge, setNewPlatformBadge] = useState('');
  const [newPlatformBg, setNewPlatformBg] = useState('bg-purple-600 text-white');

  // Modal d'édition Ticket
  const [selectedTicket, setSelectedTicket] = useState<TicketOrder | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Formulaire d'édition dans le modal
  const [editStatus, setEditStatus] = useState<QuoteStatus>('pending');
  const [editShippingMode, setEditShippingMode] = useState<ShippingModeType>('air');
  const [editItems, setEditItems] = useState<OrderItem[]>([]);
  const [editAdminNote, setEditAdminNote] = useState('');
  const [editDepositRequired, setEditDepositRequired] = useState(0);
  const [editDepositPaid, setEditDepositPaid] = useState(0);
  const [editDiscount, setEditDiscount] = useState(0);
  const [editSupplierOrderNumber, setEditSupplierOrderNumber] = useState('');
  const [editCarrierTrackingNumber, setEditCarrierTrackingNumber] = useState('');
  const [editCarrierName, setEditCarrierName] = useState('');
  const [newTimelineStepTitle, setNewTimelineStepTitle] = useState('');
  const [newTimelineStepDesc, setNewTimelineStepDesc] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const search = new URLSearchParams(window.location.search);
      const isNative = !!(window as any).Capacitor?.isNativePlatform?.();
      const isMobileParam = search.get('app') === 'mobile';
      if (isNative || isMobileParam) {
        setIsMobileMode(true);
      }
    }
    fetchSubscriptionStatus();
    const isAuth = sessionStorage.getItem('cs_admin_auth') || localStorage.getItem('cs_admin_auth');
    if (isAuth === 'true') {
      setIsAuthenticated(true);
      const isSuperAdminFlag = sessionStorage.getItem('cs_is_super_admin') === 'true' || localStorage.getItem('cs_is_super_admin') === 'true';
      if (isSuperAdminFlag) {
        setSubscriptionInfo(prev => prev ? { ...prev, isSuperAdmin: true } : null);
      }
      fetchTickets();
      fetchSettings();
      fetchGroupBuys();
      fetchAnalytics();
      fetchDeliveredOrders();
    }
  }, []);

  const fetchGroupBuys = async () => {
    try {
      setLoadingGb(true);
      const res = await fetch('/api/group-buys');
      const data = await res.json();
      if (data.success && Array.isArray(data.groupBuys)) {
        setGroupBuys(data.groupBuys);
      }
    } catch (err) {
      console.error('Erreur chargement ventes groupées:', err);
    } finally {
      setLoadingGb(false);
    }
  };

  const handleOpenCreateGb = () => {
    setEditingGb(null);
    setGbTitle('');
    setGbDescription('');
    setGbImageUrl('https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop&q=80');
    setGbPriceCFA('');
    setGbOriginalPriceCFA('');
    setGbMinQty(10);
    setGbOrderDate(new Date(Date.now() + 7 * 86400 * 1000).toISOString().split('T')[0]);
    setGbShippingMode('air');
    setGbPlatform('shein');
    setGbVariants('Taille S, Taille M, Taille L');
    setGbStatus('open');
    setGbError(null);
    setShowGbModal(true);
  };

  const handleOpenEditGb = (item: GroupBuyItem) => {
    setEditingGb(item);
    setGbTitle(item.title);
    setGbDescription(item.description);
    setGbImageUrl(item.imageUrl);
    setGbPriceCFA(item.priceCFA);
    setGbOriginalPriceCFA(item.originalPriceCFA || '');
    setGbMinQty(item.minQuantity);
    setGbOrderDate(item.orderDate);
    setGbShippingMode(item.shippingMode);
    setGbPlatform(item.platform || 'shein');
    setGbVariants(item.variants ? item.variants.join(', ') : '');
    setGbStatus(item.status);
    setGbError(null);
    setShowGbModal(true);
  };

  const handleSaveGroupBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    setGbError(null);

    if (!gbTitle.trim() || !gbPriceCFA || !gbMinQty || !gbOrderDate.trim()) {
      setGbError('Veuillez remplir le titre, le prix, la quantité minimum et la date de commande.');
      return;
    }

    try {
      const payload = {
        title: gbTitle.trim(),
        description: gbDescription.trim(),
        imageUrl: gbImageUrl.trim(),
        priceCFA: Number(gbPriceCFA),
        originalPriceCFA: gbOriginalPriceCFA ? Number(gbOriginalPriceCFA) : undefined,
        minQuantity: Number(gbMinQty),
        orderDate: gbOrderDate.trim(),
        shippingMode: gbShippingMode,
        platform: gbPlatform,
        variants: gbVariants.split(',').map(v => v.trim()).filter(Boolean),
        status: gbStatus
      };

      if (editingGb) {
        const res = await fetch(`/api/group-buys/${editingGb.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Erreur mise à jour');
        setGroupBuys(prev => prev.map(g => g.id === editingGb.id ? data.groupBuy : g));
      } else {
        const res = await fetch('/api/group-buys', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Erreur création');
        setGroupBuys(prev => [data.groupBuy, ...prev]);
      }

      setShowGbModal(false);
      setGbSuccess(true);
      setTimeout(() => setGbSuccess(false), 3000);
    } catch (err: any) {
      setGbError(err.message || 'Une erreur est survenue');
    }
  };

  const handleDeleteGroupBuy = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cet article de vente en groupe ?')) return;
    try {
      const res = await fetch(`/api/group-buys/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setGroupBuys(prev => prev.filter(g => g.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChangeGb = async (id: string, newStatus: GroupBuyStatus) => {
    try {
      const res = await fetch(`/api/group-buys/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setGroupBuys(prev => prev.map(g => g.id === id ? data.groupBuy : g));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ============================================================
  // HANDLERS : GESTION DES COLIS REÇUS (PREUVES CLIENTS)
  // ============================================================
  const fetchDeliveredOrders = async () => {
    try {
      setLoadingDeliveredOrders(true);
      const res = await fetch('/api/delivered-orders');
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setDeliveredOrders(data.orders);
      }
    } catch (err) {
      console.error('Erreur chargement colis reçus:', err);
    } finally {
      setLoadingDeliveredOrders(false);
    }
  };

  const handleOpenCreateDelivered = () => {
    setEditingDeliveredOrder(null);
    setDelClientName('');
    setDelLocation('Cotonou (Akpakpa)');
    setDelTicketId('');
    setDelPlatform('Shein');
    setDelShippingMode('air');
    setDelTransitDays(18);
    setDelDeliveryDate('Reçu il y a 3 jours');
    setDelTitle('');
    setDelItemsSummary('');
    setDelRating(5);
    setDelReview('Colis bien emballé et reçu sans aucun dommage. Articles 100% conformes !');
    setDelImageUrl('https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop&q=80');
    setDelVerified(true);
    setDelError(null);
    setShowDeliveredModal(true);
  };

  const handleOpenEditDelivered = (item: DeliveredOrder) => {
    setEditingDeliveredOrder(item);
    setDelClientName(item.clientName);
    setDelLocation(item.location);
    setDelTicketId(item.ticketId || '');
    setDelPlatform(item.platform);
    setDelShippingMode(item.shippingMode);
    setDelTransitDays(item.transitDays || 18);
    setDelDeliveryDate(item.deliveryDate || 'Récemment reçu');
    setDelTitle(item.title);
    setDelItemsSummary(item.itemsSummary || '');
    setDelRating(item.rating || 5);
    setDelReview(item.review || '');
    setDelImageUrl(item.imageUrl || '');
    setDelVerified(item.verified !== false);
    setDelError(null);
    setShowDeliveredModal(true);
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      alert('La photo est trop lourde (max 4 Mo). Veuillez choisir une photo plus légère.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setDelImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveDeliveredOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setDelError(null);

    if (!delClientName.trim() || !delTitle.trim() || !delImageUrl.trim()) {
      setDelError('Veuillez renseigner le nom du client, le titre et la photo.');
      return;
    }

    try {
      setDelSaving(true);
      const payload = {
        clientName: delClientName.trim(),
        location: delLocation.trim() || 'Cotonou, Bénin',
        ticketId: delTicketId.trim(),
        platform: delPlatform,
        shippingMode: delShippingMode,
        transitDays: Number(delTransitDays) || 18,
        deliveryDate: delDeliveryDate.trim() || 'Récemment livré',
        title: delTitle.trim(),
        itemsSummary: delItemsSummary.trim() || delTitle.trim(),
        rating: Number(delRating) || 5,
        review: delReview.trim(),
        imageUrl: delImageUrl.trim(),
        verified: delVerified
      };

      if (editingDeliveredOrder) {
        const res = await fetch(`/api/delivered-orders/${editingDeliveredOrder.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Erreur mise à jour');
        setDeliveredOrders(prev => prev.map(o => o.id === editingDeliveredOrder.id ? data.order : o));
      } else {
        const res = await fetch('/api/delivered-orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Erreur création');
        setDeliveredOrders(prev => [data.order, ...prev]);
      }

      setShowDeliveredModal(false);
      setDelSuccess(editingDeliveredOrder ? 'Preuve de réception mise à jour !' : 'Nouveau colis reçu ajouté avec succès !');
      setTimeout(() => setDelSuccess(null), 3500);
    } catch (err: any) {
      setDelError(err.message || 'Une erreur est survenue lors de l\'enregistrement.');
    } finally {
      setDelSaving(false);
    }
  };

  const handleDeleteDeliveredOrder = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce colis reçu de la galerie et du carrousel public ?')) return;
    try {
      const res = await fetch(`/api/delivered-orders/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Erreur suppression');
      setDeliveredOrders(prev => prev.filter(o => o.id !== id));
      setDelSuccess('Colis supprimé du carrousel.');
      setTimeout(() => setDelSuccess(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Erreur suppression');
    }
  };

  const handleResetDefaultDeliveredOrders = async () => {
    if (!confirm('Voulez-vous réinitialiser la liste des colis reçus avec les exemples d\'origine ?')) return;
    try {
      const res = await fetch('/api/delivered-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_default' })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Erreur réinitialisation');
      setDeliveredOrders(data.orders);
      setDelSuccess('Galerie réinitialisée avec succès aux modèles par défaut !');
      setTimeout(() => setDelSuccess(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Erreur réinitialisation');
    }
  };

  const handlePromoteTicketToDeliveredProof = (ticket: TicketOrder) => {
    setEditingDeliveredOrder(null);
    setDelClientName(ticket.client?.name || 'Client Christaline');
    setDelLocation(ticket.client?.city ? `${ticket.client.city} (Bénin)` : 'Cotonou, Bénin');
    setDelTicketId(ticket.id);
    const platform = (ticket.items?.[0]?.platform as any) || 'Shein';
    setDelPlatform(['Shein', 'Temu', 'Alibaba'].includes(platform) ? platform : 'Autre');
    setDelShippingMode(ticket.shippingMode || 'air');
    setDelTransitDays(ticket.shippingMode === 'sea' ? 65 : 18);
    setDelDeliveryDate('Reçu récemment');
    setDelTitle(ticket.items?.[0]?.name ? `Commande : ${ticket.items[0].name}` : `Commande de ${ticket.client?.name}`);
    setDelItemsSummary(ticket.items?.map(i => `${i.quantity}x ${i.name}`).join(' + ') || 'Articles livrés');
    setDelRating(5);
    setDelReview('Colis bien reçu à destination, très satisfait du service de Christaline Shop !');
    setDelImageUrl(ticket.items?.[0]?.url && ticket.items[0].url.startsWith('http') ? ticket.items[0].url : 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop&q=80');
    setDelVerified(true);
    setDelError(null);
    setIsEditing(false);
    setShowDeliveredModal(true);
  };

  const fetchSubscriptionStatus = async () => {
    try {
      const res = await fetch('/api/subscription/status');
      const data = await res.json();
      if (data.success && data.status) {
        setSubscriptionInfo(data.status);
      }
    } catch (err) {
      console.error('Erreur statut souscription:', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setLoading(true);

    try {
      const res = await fetch('/api/subscription/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password.trim() })
      });

      const data = await res.json();

      if (res.status === 403 || data.expired) {
        setSubscriptionInfo({
          isExpired: true,
          expiresAt: data.expiresAt || new Date().toISOString(),
          daysRemaining: 0,
          monthlyFeeCFA: data.monthlyFeeCFA || 15000,
          subscriptionDurationDays: data.subscriptionDurationDays || 30
        });
        setShowRenewalModal(true);
        setAuthError(data.error || 'Votre abonnement a expiré. Veuillez le renouveler avec FeexPay.');
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Mot de passe incorrect.');
      }

      setIsAuthenticated(true);
      setClientAuth(data.isSuperAdmin ? 'super-admin' : 'admin', !!data.isSuperAdmin);
      setSubscriptionInfo({
        isExpired: false,
        expiresAt: data.expiresAt,
        daysRemaining: data.daysRemaining || 30,
        monthlyFeeCFA: data.monthlyFeeCFA || 15000,
        subscriptionDurationDays: data.subscriptionDurationDays || 30,
        isSuperAdmin: data.isSuperAdmin
      });
      fetchTickets();
      fetchSettings();
      fetchGroupBuys();
      fetchAnalytics();
      fetchDeliveredOrders();
    } catch (err: any) {
      setAuthError(err.message || 'Mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  const pollPaymentStatus = (ref: string) => {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      if (attempts > 20) {
        clearInterval(interval);
        setWaitingForMobilePin(false);
        setPaymentError('Délai de validation mobile écoulé. Si vous avez validé le paiement sur votre téléphone, cliquez sur "J\'ai validé (Vérifier)".');
        return;
      }
      try {
        const res = await fetch('/api/subscription/feexpay/check-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reference: ref,
            phoneNumber: renewalPhone.trim(),
            operator: renewalOperator,
            amountCFA: subscriptionInfo?.monthlyFeeCFA || 15000
          })
        });
        const data = await res.json();
        if (data.success && data.status === 'SUCCESS') {
          clearInterval(interval);
          setWaitingForMobilePin(false);
          setPaymentSuccessData({
            newPassword: data.newPassword,
            expiresAt: data.expiresAt
          });
          setPassword(data.newPassword);
          setAuthError('');
          fetchSubscriptionStatus();
        } else if (data.status === 'FAILED' || data.status === 'INSUFFICIENT_FUNDS') {
          clearInterval(interval);
          setWaitingForMobilePin(false);
          setPaymentError(data.error || 'Le paiement a échoué ou a été refusé sur votre mobile.');
        }
      } catch (err) {
        // ignore polling network errors
      }
    }, 4000);
  };

  const handleManualCheckPendingStatus = async () => {
    if (!pendingPaymentRef) return;
    setProcessingPayment(true);
    setPaymentError(null);
    try {
      const res = await fetch('/api/subscription/feexpay/check-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: pendingPaymentRef,
          phoneNumber: renewalPhone.trim(),
          operator: renewalOperator,
          amountCFA: subscriptionInfo?.monthlyFeeCFA || 15000,
          forceConfirm: false
        })
      });
      const data = await res.json();
      if (data.success && data.status === 'SUCCESS') {
        setWaitingForMobilePin(false);
        setPaymentSuccessData({
          newPassword: data.newPassword,
          expiresAt: data.expiresAt
        });
        setPassword(data.newPassword);
        setAuthError('');
        fetchSubscriptionStatus();
      } else if (data.status === 'PENDING') {
        alert('Votre paiement est toujours en attente de validation sur votre téléphone Mobile Money.');
      } else {
        throw new Error(data.error || 'Transaction non validée.');
      }
    } catch (err: any) {
      setPaymentError(err.message || 'Erreur lors de la vérification.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleFeexPayRenewal = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessingPayment(true);
    setPaymentError(null);
    setPaymentSuccessData(null);
    setWaitingForMobilePin(false);
    setPaymentUrl(undefined);

    try {
      const initRes = await fetch('/api/subscription/feexpay/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: renewalPhone.trim(),
          operator: renewalOperator,
          fullName: 'Administrateur Christaline'
        })
      });

      const initData = await initRes.json();
      if (!initRes.ok || !initData.success) {
        throw new Error(initData.error || 'Erreur initialisation FeexPay');
      }

      setPendingPaymentRef(initData.reference);
      if (initData.paymentUrl) setPaymentUrl(initData.paymentUrl);

      // Si mode LIVE : attendre la validation sur le téléphone
      if (initData.mode === 'LIVE') {
        setWaitingForMobilePin(true);
        setProcessingPayment(false);
        pollPaymentStatus(initData.reference);
        return;
      }

      // Si mode SANDBOX : confirmation immédiate de test
      const confirmRes = await fetch('/api/subscription/feexpay/check-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: initData.reference,
          phoneNumber: renewalPhone.trim(),
          operator: renewalOperator,
          amountCFA: initData.amountCFA,
          forceConfirm: true
        })
      });

      const confirmData = await confirmRes.json();
      if (!confirmRes.ok || !confirmData.success) {
        throw new Error(confirmData.error || 'Erreur confirmation paiement');
      }

      setPaymentSuccessData({
        newPassword: confirmData.newPassword,
        expiresAt: confirmData.expiresAt
      });

      setPassword(confirmData.newPassword);
      setAuthError('');
      fetchSubscriptionStatus();

    } catch (err: any) {
      setPaymentError(err.message || 'Erreur lors du paiement FeexPay');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setClientAuth('none');
  };

  const fetchAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      const res = await fetch('/api/analytics');
      const data = await res.json();
      if (data.success && data.summary) {
        setAnalyticsSummary(data.summary);
      }
    } catch (err) {
      console.error('Erreur chargement analytics:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const handleResetAnalytics = async () => {
    if (!confirm('Voulez-vous vraiment réinitialiser toutes les statistiques de visites et conversions ?')) return;
    try {
      const res = await fetch('/api/analytics', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchAnalytics();
      }
    } catch (err) {
      console.error('Erreur reset analytics:', err);
    }
  };

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tickets');
      const data = await res.json();
      if (data.success) {
        setTickets(data.tickets);
      }
    } catch (err) {
      console.error('Erreur chargement tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error('Erreur chargement paramètres:', err);
    }
  };

  const saveSettingsToServer = async (newSettings: AppSettings) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        refreshSettings();
        setSettingsSuccess(true);
        setTimeout(() => setSettingsSuccess(false), 3000);
      }
    } catch (err) {
      alert('Erreur enregistrement');
    }
  };

  const handleTestTelegram = async () => {
    if (!settings?.telegram?.botToken || !settings?.telegram?.chatId) {
      alert('Veuillez renseigner le Bot Token et le Chat ID avant de lancer le test.');
      return;
    }
    setTestingTelegram(true);
    setTelegramTestResult(null);
    try {
      const res = await fetch('/api/telegram/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken: settings.telegram.botToken,
          chatId: settings.telegram.chatId
        })
      });
      const data = await res.json();
      if (data.success) {
        setTelegramTestResult({
          success: true,
          message: 'Connexion réussie ! Message de test envoyé avec succès sur Telegram.',
          botName: data.botName,
          botUsername: data.botUsername
        });
      } else {
        setTelegramTestResult({
          success: false,
          message: data.error || 'Échec du test de connexion'
        });
      }
    } catch (err: any) {
      setTelegramTestResult({
        success: false,
        message: err.message || 'Erreur réseau lors du test'
      });
    } finally {
      setTestingTelegram(false);
    }
  };

  // Basculer l'état actif/inactif d'une plateforme (ex: réactiver Alibaba en 1 clic)
  const togglePlatform = (pltId: string) => {
    if (!settings) return;
    const updated = settings.platforms.map(p => 
      p.id === pltId ? { ...p, enabled: !p.enabled } : p
    );
    const newSettings = { ...settings, platforms: updated };
    setSettings(newSettings);
    saveSettingsToServer(newSettings);
  };

  // Ajouter une nouvelle plateforme de vente
  const handleAddPlatform = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings || !newPlatformName.trim()) return;

    const id = newPlatformName.trim().toLowerCase().replace(/\s+/g, '-');
    if (settings.platforms.some(p => p.id === id)) {
      alert('Cette plateforme existe déjà !');
      return;
    }

    const newPlt: StorePlatform = {
      id,
      name: newPlatformName.trim(),
      logoText: (newPlatformBadge.trim() || newPlatformName.trim()).toUpperCase(),
      bg: newPlatformBg,
      border: 'border-transparent',
      color: 'text-white',
      enabled: true
    };

    const newSettings = {
      ...settings,
      platforms: [...settings.platforms, newPlt]
    };

    setSettings(newSettings);
    saveSettingsToServer(newSettings);
    setNewPlatformName('');
    setNewPlatformBadge('');
  };

  // Supprimer une plateforme personnalisée
  const handleDeletePlatform = (pltId: string) => {
    if (!settings) return;
    if (pltId === 'shein' || pltId === 'temu') {
      alert('Vous ne pouvez pas supprimer Shein ou Temu. Vous pouvez simplement les désactiver.');
      return;
    }
    if (!confirm('Supprimer cette plateforme ?')) return;

    const newSettings = {
      ...settings,
      platforms: settings.platforms.filter(p => p.id !== pltId)
    };
    setSettings(newSettings);
    saveSettingsToServer(newSettings);
  };

  const openEditModal = (t: TicketOrder) => {
    setSelectedTicket(t);
    setEditStatus(t.quote.status);
    setEditShippingMode(t.shippingMode || 'air');
    setEditItems(JSON.parse(JSON.stringify(t.items)));
    setEditAdminNote(t.quote.adminNote || '');
    setEditDepositRequired(t.quote.depositRequiredCFA || 0);
    setEditDepositPaid(t.quote.depositPaidCFA || 0);
    setEditDiscount(t.quote.discountCFA || 0);
    setEditSupplierOrderNumber(t.tracking.supplierOrderNumber || '');
    setEditCarrierTrackingNumber(t.tracking.carrierTrackingNumber || '');
    setEditCarrierName(t.tracking.carrierName || (t.shippingMode === 'sea' ? 'Fret Maritime Cotonou' : 'Cargo Aérien Cotonou'));
    setNewTimelineStepTitle('');
    setNewTimelineStepDesc('');
    setSaveSuccess(false);
    setSaveError(null);
    setIsEditing(true);
  };

  const updateItemTotalPrice = (idx: number, val: number) => {
    const updated = [...editItems];
    const it = { ...updated[idx], totalItemCFA: val, unitPriceCFA: val };
    updated[idx] = it;
    setEditItems(updated);
  };

  const computedGrandTotal = Math.max(0, editItems.reduce((acc, it) => acc + (it.totalItemCFA || 0), 0) - editDiscount);
  const computedBalanceRemaining = Math.max(0, computedGrandTotal - editDepositPaid);

  const handleSaveTicket = async () => {
    if (!selectedTicket) return;
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const estimatedDelivery = editShippingMode === 'sea' ? '2 à 3 mois' : 'Au plus 1 mois';

      const payload: any = {
        shippingMode: editShippingMode,
        items: editItems,
        status: editStatus,
        quote: {
          status: editStatus,
          subtotalItemsCFA: computedGrandTotal + editDiscount,
          discountCFA: editDiscount,
          grandTotalCFA: computedGrandTotal,
          depositRequiredCFA: editDepositRequired || Math.round(computedGrandTotal * 0.6),
          depositPaidCFA: editDepositPaid,
          balanceRemainingCFA: computedBalanceRemaining,
          adminNote: editAdminNote
        },
        tracking: {
          shippingMode: editShippingMode,
          estimatedDelivery,
          supplierOrderNumber: editSupplierOrderNumber.trim() || null,
          carrierTrackingNumber: editCarrierTrackingNumber.trim() || null,
          carrierName: editCarrierName.trim() || null
        }
      };

      if (newTimelineStepTitle.trim()) {
        payload.tracking.customEvent = {
          title: newTimelineStepTitle.trim(),
          description: newTimelineStepDesc.trim() || 'Étape enregistrée par Christaline Shop Bénin',
          location: editShippingMode === 'sea' ? 'Port Autonome de Cotonou' : 'Hub Cotonou'
        };
      }

      const res = await fetch(`/api/tickets/${selectedTicket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de la sauvegarde');
      }

      setSaveSuccess(true);
      setTickets(tickets.map(t => t.id === selectedTicket.id ? data.ticket : t));
      setSelectedTicket(data.ticket);

      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);

    } catch (err: any) {
      setSaveError(err.message || 'Erreur inconnue');
    }
  };

  const handleDeleteTicket = async (id: string) => {
    if (!confirm(`Confirmez-vous la suppression du ticket ${id} ?`)) return;

    try {
      const res = await fetch(`/api/tickets/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTickets(tickets.filter(t => t.id !== id));
        if (selectedTicket?.id === id) {
          setIsEditing(false);
          setSelectedTicket(null);
        }
      }
    } catch (err) {
      alert('Erreur suppression');
    }
  };

  const generateClientWhatsAppMessage = (t: TicketOrder) => {
    const total = t.quote.grandTotalCFA > 0 ? `${new Intl.NumberFormat('fr-FR').format(t.quote.grandTotalCFA)} FCFA` : '';
    const deposit = t.quote.depositRequiredCFA > 0 ? `${new Intl.NumberFormat('fr-FR').format(t.quote.depositRequiredCFA)} FCFA` : '';
    const currentUrl = typeof window !== 'undefined' ? `${window.location.origin}/ticket/${t.id}` : `https://christaline.shop/ticket/${t.id}`;
    const modeLabel = t.shippingMode === 'sea' ? 'Voie Maritime (2 à 3 mois)' : 'Voie Aérienne (Au plus 1 mois)';

    let msg = `Bonjour ${t.client.name} ! 🌸\nC'est l'équipe Christaline Shop Bénin concernant votre ticket *${t.id}*.\n\n`;

    if (t.quote.status === 'ready') {
      msg += `✨ Votre devis est prêt !\n`
        + `💰 Montant total de vos articles : *${total}*\n`
        + `💵 Acompte pour valider la commande : *${deposit}*\n`
        + `📦 Mode de livraison : *${modeLabel}*\n\n`
        + `👉 Consultez votre ticket et les instructions de paiement Mobile Money ici :\n${currentUrl}\n\n`
        + `Paiement accepté : MTN Mobile Money Bénin, Moov Money Bénin, Celtiis Cash.`;
    } else if (t.quote.status === 'in_transit') {
      msg += `🚢✈️ Bonne nouvelle ! Vos articles ont été expédiés (${modeLabel}) et sont en route vers le Bénin.\n`
        + `👉 Suivez l'avancée de votre colis en direct sur votre ticket :\n${currentUrl}`;
    } else if (t.quote.status === 'ready_for_pickup') {
      msg += `🎉 Vos articles sont arrivés à Cotonou et sont prêts pour la livraison !\n`
        + `💵 Solde restant à régler : ${new Intl.NumberFormat('fr-FR').format(t.quote.balanceRemainingCFA)} FCFA\n`
        + `Merci de nous confirmer votre adresse exacte pour la remise du colis.`;
    } else {
      msg += `📌 Mise à jour de votre commande : *${t.tracking.statusLabel}*\n`
        + `👉 Consultez l'état d'avancement ici : ${currentUrl}`;
    }

    const cleanPhone = t.client.whatsapp.replace(/\D/g, '');
    const phoneWithCode = cleanPhone.startsWith('229') ? cleanPhone : `229${cleanPhone}`;
    return `https://wa.me/${phoneWithCode}?text=${encodeURIComponent(msg)}`;
  };

  const filteredTickets = tickets.filter(t => {
    const matchesStatus = statusFilter === 'all' || t.quote.status === statusFilter;
    const matchesSearch = searchQuery === '' || 
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.client.phone.includes(searchQuery) ||
      t.client.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const countPending = tickets.filter(t => t.quote.status === 'pending').length;
  const countReady = tickets.filter(t => t.quote.status === 'ready').length;
  const countInTransit = tickets.filter(t => ['paid_deposit', 'ordered', 'in_transit', 'customs'].includes(t.quote.status)).length;
  const countDelivered = tickets.filter(t => t.quote.status === 'delivered').length;
  const totalVolume = tickets.reduce((acc, t) => acc + (t.quote.grandTotalCFA || 0), 0);
  const totalCollected = tickets.reduce((acc, t) => acc + (t.quote.depositPaidCFA || 0), 0);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-stone-900 text-stone-100">
        {isMobileMode ? (
          <header className="bg-rose-900/90 border-b border-rose-800 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-400/20 flex items-center justify-center">
                <Crown className="w-4 h-4 text-amber-400" />
              </div>
              <span className="font-bold text-sm text-white">Christaline Admin</span>
            </div>
            <span className="text-[10px] bg-rose-800 text-rose-200 px-2 py-0.5 rounded-full font-bold">App Mobile</span>
          </header>
        ) : (
          <Navbar />
        )}
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-stone-800 rounded-3xl p-8 border border-stone-700 shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 text-white flex items-center justify-center mx-auto shadow-lg">
              <Lock className="w-8 h-8" />
            </div>

            <div>
              <h1 className="text-2xl font-black text-white font-serif">
                Espace Gestion Christaline • Bénin
              </h1>
              <p className="text-xs text-stone-400 mt-1">
                Accès réservé pour chiffrer les devis et gérer le suivi des commandes
              </p>
            </div>

            {authError && (
              <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  type="password"
                  required
                  placeholder="Mot de passe d'administration"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-stone-900 border border-stone-700 text-white text-sm focus:border-rose-500 outline-hidden text-center"
                />
                <p className="text-[11px] text-stone-500 mt-2">
                  (Mot de passe par défaut : <code>admin123</code> ou <code>0154072488</code>)
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-rose-950 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                <span>Accéder au Tableau de Bord</span>
              </button>
            </form>

            {/* Renouvellement FeexPay & Accès Super Admin */}
            <div className="pt-3 border-t border-stone-700/60 space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  setPaymentSuccessData(null);
                  setPaymentError(null);
                  setShowRenewalModal(true);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                <span>Renouveler mon abonnement ({subscriptionInfo?.monthlyFeeCFA || 15000} FCFA via FeexPay)</span>
              </button>

              <div className="flex items-center justify-center text-[11px] text-stone-500 pt-1">
                <span>Paiement sécurisé FeexPay Bénin • MoMo, Moov, Celtiis & Carte</span>
              </div>
            </div>

          </div>
        </main>
        {!isMobileMode && <Footer />}

        {/* Modal de renouvellement FeexPay (sur l'écran de login) */}
        <FeexPayRenewalModal
          isOpen={showRenewalModal}
          onClose={() => {
            setShowRenewalModal(false);
            setWaitingForMobilePin(false);
          }}
          monthlyFeeCFA={subscriptionInfo?.monthlyFeeCFA || 15000}
          subscriptionDurationDays={subscriptionInfo?.subscriptionDurationDays || 30}
          renewalPhone={renewalPhone}
          setRenewalPhone={setRenewalPhone}
          renewalOperator={renewalOperator}
          setRenewalOperator={setRenewalOperator}
          processingPayment={processingPayment}
          onSubmitRenewal={handleFeexPayRenewal}
          paymentSuccessData={paymentSuccessData}
          paymentError={paymentError}
          waitingForMobilePin={waitingForMobilePin}
          onManualCheckStatus={handleManualCheckPendingStatus}
          feexpayMode={(subscriptionInfo as any)?.feexpayMode || 'SANDBOX'}
          paymentUrl={paymentUrl}
          onSuccessProceed={() => {
            if (paymentSuccessData) {
              setShowRenewalModal(false);
              setWaitingForMobilePin(false);
              setPassword(paymentSuccessData.newPassword);
            }
          }}
        />

      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-100">
      {isMobileMode ? (
        <header className="bg-gradient-to-r from-rose-700 via-rose-600 to-pink-600 text-white px-4 py-3 sticky top-0 z-40 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20 shadow-xs">
              <Crown className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-black tracking-tight leading-tight">Christaline Admin</h1>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <p className="text-[10px] text-rose-100 font-medium">Boutique & Colis • Bénin</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button 
              type="button"
              onClick={() => { fetchTickets(); refreshSettings(); fetchDeliveredOrders(); }}
              className="p-2 bg-white/15 hover:bg-white/25 active:scale-95 text-white rounded-xl text-xs flex items-center transition-all cursor-pointer"
              title="Actualiser les données"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="p-2 bg-white/15 hover:bg-white/25 active:scale-95 text-rose-100 hover:text-white rounded-xl text-xs transition-all cursor-pointer"
              title="Déconnexion"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </header>
      ) : (
        <Navbar />
      )}

      <main className={`flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 ${isMobileMode ? 'pb-28 pt-4' : ''}`}>
        
        {/* BANDEAU EN-TÊTE ADMIN AVEC ONGLETS */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200">
                Administration Bénin
              </span>
              <span className="text-xs text-stone-400">Christaline Shop</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-serif mt-1">
              Tableau de Bord & Paramètres
            </h1>

            {/* BADGE ABONNEMENT MENSUEL & BOUTON RENOUVELER FEEXPAY */}
            {subscriptionInfo && (
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentSuccessData(null);
                    setPaymentError(null);
                    setShowRenewalModal(true);
                  }}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    subscriptionInfo.isExpired
                      ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 ring-2 ring-rose-400/20'
                      : subscriptionInfo.daysRemaining <= 5
                      ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 ring-2 ring-amber-400/20'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  }`}
                  title="Gérer ou prolonger l'abonnement FeexPay"
                >
                  <CreditCard className="w-3.5 h-3.5 text-stone-700" />
                  <span>
                    Abonnement : {subscriptionInfo.daysRemaining} jour{subscriptionInfo.daysRemaining > 1 ? 's' : ''} restant{subscriptionInfo.daysRemaining > 1 ? 's' : ''}
                  </span>
                  <span className="text-[10px] bg-white text-stone-800 px-2 py-0.5 rounded-md shadow-2xs font-black">
                    Renouveler ({subscriptionInfo.monthlyFeeCFA.toLocaleString('fr-FR')} F)
                  </span>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-full pb-1">
            {/* Boutons d'onglets (titres courts & scroll mobile) */}
            <button
              onClick={() => setActiveAdminTab('tickets')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeAdminTab === 'tickets'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Commandes ({tickets.length})</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('group_buys')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeAdminTab === 'group_buys'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Ventes Groupe ({groupBuys.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveAdminTab('delivered_orders');
                fetchDeliveredOrders();
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeAdminTab === 'delivered_orders'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Colis Reçus ({deliveredOrders.length})</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('platforms')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeAdminTab === 'platforms'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Plateformes</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('settings')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeAdminTab === 'settings'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Paramètres & Contacts</span>
              <span className="sm:hidden">Paramètres</span>
            </button>

            <button
              onClick={() => setActiveAdminTab('telegram')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeAdminTab === 'telegram'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Telegram</span>
              {settings?.telegram?.enabled && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Notifications actives" />
              )}
            </button>

            <button
              onClick={() => {
                setActiveAdminTab('marketing');
                fetchAnalytics();
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                activeAdminTab === 'marketing'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Marketing & Stats</span>
              {(settings?.marketing?.facebookPixel?.enabled || settings?.marketing?.tiktokPixel?.enabled) && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Pixels actifs" />
              )}
            </button>

            <button
              onClick={() => { fetchTickets(); fetchSettings(); fetchGroupBuys(); fetchAnalytics(); fetchDeliveredOrders(); }}
              disabled={loading || loadingGb || loadingAnalytics || loadingDeliveredOrders}
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors shrink-0 cursor-pointer"
              title="Actualiser"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading || loadingGb || loadingAnalytics || loadingDeliveredOrders ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-600 text-xs font-semibold cursor-pointer"
            >
              Déconnexion
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* ONGLET 1 : GESTION DES COMMANDES & DEVIS */}
        {/* ============================================================ */}
        {activeAdminTab === 'tickets' && (
          <div className="space-y-8">
            
            {/* KPI STATISTIQUES */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs">
                <div className="flex items-center justify-between text-stone-400 text-xs font-bold uppercase">
                  <span>Total Tickets</span>
                  <ShoppingBag className="w-4 h-4 text-stone-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-stone-900 mt-2">
                  {tickets.length}
                </div>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-200 shadow-2xs bg-amber-50/20">
                <div className="flex items-center justify-between text-amber-700 text-xs font-bold uppercase">
                  <span>À Chiffrer</span>
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-700 mt-2">
                  {countPending}
                </div>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-blue-200 shadow-2xs bg-blue-50/20">
                <div className="flex items-center justify-between text-blue-700 text-xs font-bold uppercase">
                  <span>Devis Prêts</span>
                  <Edit3 className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-blue-700 mt-2">
                  {countReady}
                </div>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-cyan-200 shadow-2xs bg-cyan-50/20">
                <div className="flex items-center justify-between text-cyan-700 text-xs font-bold uppercase">
                  <span>En Transit Bénin</span>
                  <Plane className="w-4 h-4 text-cyan-500" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-cyan-700 mt-2">
                  {countInTransit}
                </div>
              </div>

              <div className="col-span-2 lg:col-span-1 bg-white p-4 sm:p-5 rounded-2xl border border-emerald-200 shadow-2xs bg-emerald-50/20">
                <div className="flex items-center justify-between text-emerald-700 text-xs font-bold uppercase">
                  <span>Acomptes Encaissés</span>
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-2">
                  {new Intl.NumberFormat('fr-FR').format(totalCollected)} <span className="text-xs font-normal">F</span>
                </div>
              </div>
            </div>

            {/* TABLEAU DES COMMANDES */}
            <div className="bg-white p-4 sm:p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-96">
                  <input
                    type="text"
                    placeholder="Rechercher par N° ticket, client, téléphone, ville..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:border-rose-500 outline-hidden"
                  />
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                </div>

                <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
                  {[
                    { id: 'all', label: 'Tous' },
                    { id: 'pending', label: 'À chiffrer' },
                    { id: 'ready', label: 'Devis prêts' },
                    { id: 'in_transit', label: 'En transit' },
                    { id: 'delivered', label: 'Livrés' }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setStatusFilter(f.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        statusFilter === f.id
                          ? 'bg-rose-600 text-white'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-stone-50 text-stone-500 uppercase text-[11px] font-bold border-y border-stone-200">
                    <tr>
                      <th className="py-3 px-4">Ticket</th>
                      <th className="py-3 px-4">Client (Bénin)</th>
                      <th className="py-3 px-4">Articles & Mode</th>
                      <th className="py-3 px-4">Statut</th>
                      <th className="py-3 px-4">Prix Total</th>
                      <th className="py-3 px-4">Acompte</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-medium">
                    {filteredTickets.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-stone-400 text-sm">
                          Aucun ticket correspondant aux critères.
                        </td>
                      </tr>
                    ) : (
                      filteredTickets.map((t) => {
                        const st = STATUS_MAP[t.quote.status] || STATUS_MAP.pending;
                        const isSea = t.shippingMode === 'sea';

                        return (
                          <tr key={t.id} className="hover:bg-rose-50/30 transition-colors">
                            <td className="py-3.5 px-4 font-mono font-black text-rose-700 whitespace-nowrap">
                              {t.id}
                              <div className="text-[10px] text-stone-400 font-sans font-normal">
                                {new Date(t.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                              </div>
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="font-bold text-stone-900">{t.client.name}</div>
                              <div className="text-xs text-stone-500 flex items-center gap-1">
                                <span>{t.client.phone}</span>
                                <span>•</span>
                                <span className="text-stone-400">{t.client.city}</span>
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-1.5 mb-1">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                  isSea ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                                }`}>
                                  {isSea ? <Ship className="w-2.5 h-2.5" /> : <Plane className="w-2.5 h-2.5" />}
                                  <span>{isSea ? 'Maritime (2-3 mois)' : 'Aérien (≤ 1 mois)'}</span>
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {t.items.map((it, i) => (
                                  <span 
                                    key={i} 
                                    className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-800 text-white uppercase"
                                  >
                                    {it.platform} (x{it.quantity})
                                  </span>
                                ))}
                              </div>
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${st.badgeClass}`}>
                                {st.label}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 font-bold text-stone-900 whitespace-nowrap">
                              {t.quote.grandTotalCFA > 0 
                                ? `${new Intl.NumberFormat('fr-FR').format(t.quote.grandTotalCFA)} F`
                                : <span className="text-amber-600 text-xs italic">À chiffrer</span>
                              }
                            </td>

                            <td className="py-3.5 px-4 whitespace-nowrap">
                              {t.quote.depositPaidCFA > 0 ? (
                                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs">
                                  {new Intl.NumberFormat('fr-FR').format(t.quote.depositPaidCFA)} F
                                </span>
                              ) : (
                                <span className="text-stone-400 text-xs">Non versé</span>
                              )}
                            </td>

                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <a
                                  href={generateClientWhatsAppMessage(t)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                                  title="Envoyer devis ou suivi sur WhatsApp"
                                >
                                  <MessageCircle className="w-3.5 h-3.5 fill-emerald-600" />
                                </a>

                                <Link
                                  href={`/ticket/${t.id}`}
                                  target="_blank"
                                  className="p-2 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors"
                                  title="Voir comme le client"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </Link>

                                <button
                                  onClick={() => openEditModal(t)}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-colors cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>Gérer</span>
                                </button>

                                <button
                                  onClick={() => handleDeleteTicket(t.id)}
                                  className="p-2 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ============================================================ */}
        {/* ONGLET 2 : GESTION DES PLATEFORMES DE VENTE (NOUVEAU) */}
        {/* ============================================================ */}
        {activeAdminTab === 'platforms' && settings && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-8">
            <div className="border-b border-stone-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-black text-stone-900 font-serif flex items-center gap-2">
                  <Layers className="w-5 h-5 text-rose-600" />
                  <span>Gestion des Plateformes de Vente</span>
                </h2>
                <p className="text-xs text-stone-500">
                  Activez, désactivez ou ajoutez de nouvelles plateformes d'achat proposées aux clients sur le formulaire.
                </p>
              </div>

              {settingsSuccess && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Plateformes mises à jour !</span>
                </div>
              )}
            </div>

            {/* Liste des plateformes existantes */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-stone-700 uppercase tracking-wider">
                Plateformes configurées :
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {settings.platforms.map((plt) => (
                  <div 
                    key={plt.id} 
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      plt.enabled ? 'bg-stone-50 border-stone-300' : 'bg-stone-100/60 border-dashed border-stone-300 opacity-60'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${plt.bg}`}>
                          {plt.logoText || plt.name}
                        </span>
                        <span className="font-bold text-stone-900 text-sm">{plt.name}</span>
                      </div>
                      <div className="text-xs text-stone-500">
                        Statut : {plt.enabled ? <strong className="text-emerald-600">Active sur le site</strong> : <span className="text-stone-400">Désactivée</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Bouton Toggle Actif / Inactif */}
                      <button
                        onClick={() => togglePlatform(plt.id)}
                        className={`p-1.5 rounded-xl border transition-colors cursor-pointer text-xs font-bold flex items-center gap-1 ${
                          plt.enabled 
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200' 
                            : 'bg-stone-200 text-stone-700 border-stone-300 hover:bg-stone-300'
                        }`}
                        title={plt.enabled ? 'Désactiver' : 'Activer'}
                      >
                        {plt.enabled ? 'Activée' : 'Désactivée'}
                      </button>

                      {plt.id !== 'shein' && plt.id !== 'temu' && plt.id !== 'alibaba' && (
                        <button
                          onClick={() => handleDeletePlatform(plt.id)}
                          className="p-1.5 text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Supprimer cette plateforme"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Formulaire d'ajout d'une nouvelle plateforme */}
            <form onSubmit={handleAddPlatform} className="bg-rose-50/50 p-6 rounded-3xl border border-rose-200 space-y-4">
              <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                <Plus className="w-4 h-4 text-rose-600" />
                <span>Ajouter une nouvelle plateforme de vente</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Nom de la plateforme <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: AliExpress, Zara, Amazon..."
                    value={newPlatformName}
                    onChange={(e) => setNewPlatformName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Texte court du badge
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: ALIEXPRESS, ZARA..."
                    value={newPlatformBadge}
                    onChange={(e) => setNewPlatformBadge(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm uppercase font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Couleur du badge
                  </label>
                  <select
                    value={newPlatformBg}
                    onChange={(e) => setNewPlatformBg(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm font-bold"
                  >
                    <option value="bg-purple-600 text-white">Violet / Purple</option>
                    <option value="bg-blue-600 text-white">Bleu / Blue</option>
                    <option value="bg-emerald-600 text-white">Vert / Green</option>
                    <option value="bg-red-600 text-white">Rouge / Red</option>
                    <option value="bg-stone-900 text-white">Noir / Black</option>
                    <option value="bg-amber-600 text-white">Ambre / Orange</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white text-xs font-black shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter cette plateforme</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ============================================================ */}
        {/* ONGLET 3 : PARAMÈTRES & INSTRUCTIONS DE PAIEMENT MOBILE MONEY */}
        {/* ============================================================ */}
        {activeAdminTab === 'settings' && settings && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-10">
            {/* EN-TÊTE PARAMÈTRES */}
            <div className="border-b border-stone-100 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-serif flex items-center gap-2">
                  <Settings className="w-6 h-6 text-rose-600" />
                  <span>Configuration du Site, Contacts & Paiements</span>
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 mt-1">
                  Configurez vos numéros de contact, le lien de votre communauté WhatsApp et vos comptes de paiement Mobile Money.
                </p>
              </div>

              {settingsSuccess && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200 shadow-xs animate-fade-in shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Paramètres enregistrés avec succès !</span>
                </div>
              )}
            </div>

            {/* ============================================================ */}
            {/* SECTION SPÉCIALE : APPLICATION MOBILE ANDROID (APK) */}
            {/* ============================================================ */}
            <div className="bg-gradient-to-r from-rose-900 via-stone-900 to-pink-950 text-white p-6 sm:p-7 rounded-3xl border border-rose-800/60 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center shadow-lg shrink-0">
                    <Crown className="w-6 h-6 text-amber-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                        Application Mobile Android • Christaline Admin
                      </h3>
                      <span className="text-[10px] font-bold bg-rose-500/30 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full">
                        APK v1.0
                      </span>
                    </div>
                    <p className="text-xs text-stone-300 mt-0.5">
                      Installez l'application officielle sur votre smartphone Android pour gérer vos commandes, colis et notifications partout où vous êtes.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href="/downloads/Christaline-Admin.apk"
                    download="Christaline-Admin.apk"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-black text-xs shadow-lg shadow-rose-900/50 transition-all hover:scale-102 active:scale-98 cursor-pointer"
                  >
                    <Upload className="w-4 h-4 rotate-180" />
                    <span>Télécharger l'APK (4.9 Mo)</span>
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs border-t border-white/10">
                <div className="flex items-start gap-2 text-stone-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Prise de photos et téléversement direct des preuves de livraison</span>
                </div>
                <div className="flex items-start gap-2 text-stone-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Synchronisation instantanée avec le site et la base de données</span>
                </div>
                <div className="flex items-start gap-2 text-stone-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Navigation rapide avec barre basse optimisée pour smartphone</span>
                </div>
              </div>
            </div>

            {/* ============================================================ */}
            {/* SECTION 1 : COORDONNÉES DE CONTACT & COMMUNAUTÉ WHATSAPP */}
            {/* ============================================================ */}
            <div className="space-y-6 bg-gradient-to-br from-emerald-50/60 via-teal-50/40 to-stone-50 p-5 sm:p-7 rounded-3xl border border-emerald-200/90 shadow-xs">
              <div className="flex items-center justify-between border-b border-emerald-200/70 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs">
                    <MessageCircle className="w-5 h-5 fill-white" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-stone-900 text-base">
                      Coordonnées Téléphone, WhatsApp & Communauté
                    </h3>
                    <p className="text-xs text-stone-500">
                      Gérez les numéros affichés sur le site et le lien de votre groupe ou communauté WhatsApp.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Numéro Téléphone standard */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-rose-600" />
                    <span>Numéro d'appel téléphonique</span>
                  </label>
                  <input
                    type="text"
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    placeholder="Ex: 0154072488"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm font-mono font-bold text-stone-900 focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-[11px] text-stone-500">
                    Utilisé pour les boutons « Appeler » sur mobile et le contact téléphonique.
                  </p>
                </div>

                {/* Numéro WhatsApp direct */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Numéro WhatsApp direct</span>
                  </label>
                  <input
                    type="text"
                    value={settings.whatsappNumber}
                    onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                    placeholder="Ex: 0154072488 ou 2290154072488"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm font-mono font-bold text-emerald-700 focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-[11px] text-stone-500">
                    Numéro officiel utilisé pour les discussions directes et la réception des devis.
                  </p>
                </div>
              </div>

              {/* Lien Communauté / Groupe WhatsApp */}
              <div className="space-y-2 pt-2 border-t border-emerald-100">
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>Lien de votre Communauté ou Groupe WhatsApp</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      type="url"
                      value={settings.whatsappGroupLink || ''}
                      onChange={(e) => setSettings({ ...settings, whatsappGroupLink: e.target.value })}
                      placeholder="https://chat.whatsapp.com/VotreLienDinviatationGroupe"
                      className="w-full px-4 py-2.5 rounded-xl border border-emerald-300 bg-white text-xs sm:text-sm font-mono text-stone-800 focus:ring-2 focus:ring-emerald-500 placeholder:text-stone-400"
                    />
                  </div>
                  {settings.whatsappGroupLink && (
                    <a
                      href={settings.whatsappGroupLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shrink-0 transition-colors shadow-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Tester le lien ↗</span>
                    </a>
                  )}
                </div>
                <p className="text-[11px] text-stone-500">
                  Collez ici le lien d'invitation de votre groupe ou communauté WhatsApp (ex: <code>https://chat.whatsapp.com/...</code>).
                </p>
              </div>

              {/* Destination du bouton WhatsApp associé au numéro */}
              <div className="space-y-2 pt-2 border-t border-emerald-100">
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Action du bouton WhatsApp avec le numéro :
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    (settings.whatsappButtonTarget || 'group') === 'group'
                      ? 'border-emerald-600 bg-emerald-50/80 shadow-xs'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}>
                    <input
                      type="radio"
                      name="whatsappButtonTarget"
                      value="group"
                      checked={(settings.whatsappButtonTarget || 'group') === 'group'}
                      onChange={() => setSettings({ ...settings, whatsappButtonTarget: 'group' })}
                      className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-stone-900 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Rejoindre le Groupe / Communauté WhatsApp</span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Le bouton WhatsApp sur le numéro redirige directement vers votre groupe WhatsApp pour faire grandir votre communauté.
                      </p>
                    </div>
                  </label>

                  <label className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    settings.whatsappButtonTarget === 'direct'
                      ? 'border-emerald-600 bg-emerald-50/80 shadow-xs'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}>
                    <input
                      type="radio"
                      name="whatsappButtonTarget"
                      value="direct"
                      checked={settings.whatsappButtonTarget === 'direct'}
                      onChange={() => setSettings({ ...settings, whatsappButtonTarget: 'direct' })}
                      className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-stone-900 flex items-center gap-1.5">
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Discussion privée WhatsApp directe</span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Le bouton WhatsApp ouvre une discussion privée avec vous sur WhatsApp.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* LIVE PREVIEW DU BOUTON */}
              <div className="p-4 bg-white rounded-2xl border border-emerald-200 space-y-2">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                  Aperçu du bouton WhatsApp dans l'en-tête du site :
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="bg-gradient-to-r from-rose-600 to-amber-600 p-2 px-3 rounded-xl text-white text-xs flex items-center gap-2 shadow-xs">
                    <span className="text-[11px] text-rose-100 font-medium">Barre supérieure :</span>
                    <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full font-semibold">
                      <MessageCircle className="w-3 h-3 fill-white" />
                      <span>WhatsApp : {settings.whatsappNumber || '0154072488'}</span>
                      {settings.whatsappGroupLink && (settings.whatsappButtonTarget || 'group') === 'group' && (
                        <span className="text-[9px] bg-emerald-500 text-white px-1.5 py-0.2 rounded-full font-bold ml-1">
                          Groupe
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-stone-600">
                    Destination au clic :{' '}
                    <strong className="text-stone-900 font-mono bg-stone-100 px-2 py-0.5 rounded-lg border border-stone-200">
                      {(settings.whatsappButtonTarget || 'group') === 'group' && settings.whatsappGroupLink
                        ? settings.whatsappGroupLink
                        : `wa.me/${settings.whatsappNumber || '0154072488'}`}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* ============================================================ */}
            {/* SECTION : AFFICHE OFFICIELLE DE LA PAGE D'ACCUEIL (FLYER) */}
            {/* ============================================================ */}
            <div className="space-y-6 bg-gradient-to-br from-rose-50/70 via-pink-50/40 to-stone-50 p-5 sm:p-7 rounded-3xl border border-rose-200/90 shadow-xs">
              <div className="flex items-center justify-between border-b border-rose-200/70 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-rose-600 text-white shadow-xs">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-stone-900 text-base">
                      Affiche Officielle de la Page d'Accueil (Flyer)
                    </h3>
                    <p className="text-xs text-stone-500">
                      Modifiez le visuel promotionnel ou le flyer officiel affiché en grand sur la page d'accueil de Christaline Shop.
                    </p>
                  </div>
                </div>

                <Link
                  href="/"
                  target="_blank"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-white text-rose-700 text-xs font-bold hover:bg-rose-50 transition-colors shadow-2xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Voir sur l'accueil ↗</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                {/* APERÇU ACTUEL */}
                <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
                  <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center justify-between">
                    <span>Aperçu Actuel</span>
                    <span className="text-rose-600 font-bold text-[10px]">Page d'Accueil</span>
                  </div>
                  <div className="relative h-64 w-full rounded-xl overflow-hidden bg-stone-100 border border-stone-100 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={settings.homepageFlyerUrl || '/images/christaline-flyer.jpg'}
                      alt="Affiche Officielle"
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as any).src = '/images/christaline-flyer.jpg';
                      }}
                    />
                  </div>
                  <div className="text-[10px] text-stone-400 truncate">
                    {settings.homepageFlyerUrl || '/images/christaline-flyer.jpg'}
                  </div>
                </div>

                {/* MODIFICATION & UPLOAD */}
                <div className="md:col-span-2 space-y-4">
                  {/* Bouton d'upload direct depuis appareil */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                      Option 1 : Téléverser une nouvelle affiche depuis votre appareil
                    </label>
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-stone-50 text-stone-800 font-bold text-xs cursor-pointer border border-stone-300 shadow-xs hover:border-rose-300 transition-all">
                        <Upload className="w-4 h-4 text-rose-600" />
                        <span>Sélectionner une image (Téléphone ou PC)</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 5 * 1024 * 1024) {
                              alert('L\'image est trop lourde (max 5 Mo). Veuillez choisir une image plus légère.');
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = () => {
                              if (typeof reader.result === 'string') {
                                const updated = { ...settings, homepageFlyerUrl: reader.result };
                                setSettings(updated);
                                saveSettingsToServer(updated);
                              }
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => {
                          const updated = { ...settings, homepageFlyerUrl: '/images/christaline-flyer.jpg' };
                          setSettings(updated);
                          saveSettingsToServer(updated);
                        }}
                        className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-semibold cursor-pointer transition-colors"
                      >
                        🔄 Rétablir l'affiche d'origine
                      </button>
                    </div>
                    <p className="text-[11px] text-stone-500">
                      Vous pouvez prendre directement une photo ou choisir une image depuis votre galerie de téléphone ou ordinateur.
                    </p>
                  </div>

                  {/* Option 2 : Champ URL */}
                  <div className="space-y-1.5 pt-2 border-t border-rose-100">
                    <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                      Option 2 : Ou renseigner le lien web d'une image (URL)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={settings.homepageFlyerUrl || ''}
                        onChange={(e) => setSettings({ ...settings, homepageFlyerUrl: e.target.value })}
                        placeholder="Ex: https://monsite.com/mon-flyer.jpg ou /images/christaline-flyer.jpg"
                        className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm font-mono text-stone-800 focus:ring-2 focus:ring-rose-500 placeholder:text-stone-400"
                      />
                      <button
                        type="button"
                        onClick={() => saveSettingsToServer(settings)}
                        className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                      >
                        Enregistrer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ============================================================ */}
            {/* SECTION 2 : INSTRUCTIONS ET COMPTES MOBILE MONEY */}
            {/* ============================================================ */}
            <div className="space-y-6 pt-4 border-t border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-600 text-white shadow-xs">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-stone-900">
                    Instructions & Comptes de Paiement Mobile Money (Bénin)
                  </h3>
                  <p className="text-xs text-stone-500">
                    Ces informations s'affichent automatiquement au client lorsqu'il clique sur « Valider mon devis & Régler mon acompte ».
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Titre du Modal d'Instructions
                  </label>
                  <input
                    type="text"
                    value={settings.paymentInstructions.title}
                    onChange={(e) => setSettings({
                      ...settings,
                      paymentInstructions: { ...settings.paymentInstructions, title: e.target.value }
                    })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Consigne générale de transfert
                  </label>
                  <textarea
                    rows={3}
                    value={settings.paymentInstructions.instructionsText}
                    onChange={(e) => setSettings({
                      ...settings,
                      paymentInstructions: { ...settings.paymentInstructions, instructionsText: e.target.value }
                    })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-700"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-stone-900 text-sm border-l-4 border-rose-500 pl-3">
                  Comptes Mobile Money configurés (MTN, Moov, Celtiis Bénin)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {settings.paymentInstructions.accounts.map((acc, idx) => (
                    <div key={acc.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-500 uppercase">Opérateur</label>
                        <input
                          type="text"
                          value={acc.operator}
                          onChange={(e) => {
                            const accounts = [...settings.paymentInstructions.accounts];
                            accounts[idx] = { ...accounts[idx], operator: e.target.value };
                            setSettings({ ...settings, paymentInstructions: { ...settings.paymentInstructions, accounts } });
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs font-bold bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-500 uppercase">Numéro de téléphone</label>
                        <input
                          type="text"
                          value={acc.number}
                          onChange={(e) => {
                            const accounts = [...settings.paymentInstructions.accounts];
                            accounts[idx] = { ...accounts[idx], number: e.target.value };
                            setSettings({ ...settings, paymentInstructions: { ...settings.paymentInstructions, accounts } });
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm font-mono font-bold bg-white text-rose-700"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-500 uppercase">Nom du titulaire de compte</label>
                        <input
                          type="text"
                          value={acc.holderName}
                          onChange={(e) => {
                            const accounts = [...settings.paymentInstructions.accounts];
                            accounts[idx] = { ...accounts[idx], holderName: e.target.value };
                            setSettings({ ...settings, paymentInstructions: { ...settings.paymentInstructions, accounts } });
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs bg-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Instruction après le transfert (ex: envoyer capture d'écran)
                </label>
                <input
                  type="text"
                  value={settings.paymentInstructions.confirmationNote}
                  onChange={(e) => setSettings({
                    ...settings,
                    paymentInstructions: { ...settings.paymentInstructions, confirmationNote: e.target.value }
                  })}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs"
                />
              </div>
            </div>

            {/* BOUTON D'ENREGISTREMENT GLOBAL */}
            <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-stone-500">
                Les coordonnées et instructions de paiement sont sauvegardées en temps réel sur le serveur.
              </p>
              <button
                onClick={() => saveSettingsToServer(settings)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-black text-sm shadow-md cursor-pointer transition-transform hover:scale-102"
              >
                <Save className="w-4 h-4" />
                <span>Enregistrer la Configuration & Contacts</span>
              </button>
            </div>

          </div>
        )}

        {/* ============================================================ */}
        {/* ONGLET 5 : TELEGRAM BOT & NOTIFICATIONS & GESTION */}
        {/* ============================================================ */}
        {activeAdminTab === 'telegram' && settings && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-10">
            {/* EN-TÊTE TELEGRAM */}
            <div className="border-b border-stone-100 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-200 shrink-0">
                  <Send className="w-6 h-6 -translate-x-0.5 translate-y-0.5 fill-current" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-serif">
                      Gestion & Notifications Telegram
                    </h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      settings.telegram?.enabled 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                        : 'bg-stone-100 text-stone-600 border border-stone-200'
                    }`}>
                      {settings.telegram?.enabled ? '🟢 Actif' : '⚪ Désactivé'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                    Recevez chaque précommande et réservation en temps réel sur Telegram et pilotez votre boutique via votre bot.
                  </p>
                </div>
              </div>

              {settingsSuccess && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200 shadow-xs shrink-0 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Paramètres Telegram enregistrés !</span>
                </div>
              )}
            </div>

            {/* SWITCH ACTIVATION GLOBALE */}
            <div className="flex items-center justify-between p-5 bg-gradient-to-r from-sky-50 to-blue-50/50 rounded-2xl border border-sky-200">
              <div className="space-y-0.5">
                <span className="font-extrabold text-stone-900 text-sm sm:text-base flex items-center gap-2">
                  <Bot className="w-5 h-5 text-sky-600" />
                  Activer les alertes Telegram automatiques
                </span>
                <p className="text-xs text-stone-600">
                  Envoie instantanément un message enrichi sur votre compte ou groupe Telegram pour chaque nouvelle commande.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSettings({
                  ...settings,
                  telegram: {
                    ...settings.telegram,
                    enabled: !settings.telegram.enabled
                  }
                })}
                className="cursor-pointer"
              >
                {settings.telegram?.enabled ? (
                  <ToggleRight className="w-10 h-10 text-emerald-600 transition-colors" />
                ) : (
                  <ToggleLeft className="w-10 h-10 text-stone-400 transition-colors" />
                )}
              </button>
            </div>

            {/* FORMULAIRE CONFIGURATION BOT TOKEN & CHAT ID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-stone-50 p-6 rounded-3xl border border-stone-200">
              {/* Bot Token */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Token du Bot Telegram (API Token)</span>
                  <span className="text-[10px] text-stone-500 font-normal">Fourni par @BotFather</span>
                </label>
                <input
                  type="text"
                  value={settings.telegram?.botToken || ''}
                  onChange={(e) => setSettings({
                    ...settings,
                    telegram: { ...settings.telegram, botToken: e.target.value }
                  })}
                  placeholder="Ex: 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm font-mono text-stone-900 focus:ring-2 focus:ring-sky-500"
                />
                <p className="text-[11px] text-stone-500">
                  Créez gratuitement votre bot en 1 minute sur Telegram en discutant avec <strong>@BotFather</strong>.
                </p>
              </div>

              {/* Chat ID */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Chat ID Destinataire (ou ID de groupe)</span>
                  <span className="text-[10px] text-stone-500 font-normal">Ex: 987654321 ou -100...</span>
                </label>
                <input
                  type="text"
                  value={settings.telegram?.chatId || ''}
                  onChange={(e) => setSettings({
                    ...settings,
                    telegram: { ...settings.telegram, chatId: e.target.value }
                  })}
                  placeholder="Ex: 543210987 ou -1001234567890"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm font-mono text-stone-900 focus:ring-2 focus:ring-sky-500"
                />
                <p className="text-[11px] text-stone-500">
                  Votre identifiant de discussion (obtenu via <strong>@userinfobot</strong>) ou l'ID d'un groupe où vous avez ajouté le bot.
                </p>
              </div>
            </div>

            {/* OPTIONS DE NOTIFICATIONS DÉTAILLÉES */}
            <div className="space-y-3">
              <h3 className="font-extrabold text-stone-900 text-sm border-l-4 border-sky-500 pl-3">
                Types d'alertes à recevoir sur Telegram :
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-stone-200 bg-white hover:bg-stone-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.telegram?.notifyNewOrders ?? true}
                    onChange={(e) => setSettings({
                      ...settings,
                      telegram: { ...settings.telegram, notifyNewOrders: e.target.checked }
                    })}
                    className="mt-0.5 rounded text-sky-600 focus:ring-sky-500"
                  />
                  <div>
                    <span className="font-bold text-xs text-stone-900 block">Nouvelles Précommandes</span>
                    <span className="text-[11px] text-stone-500">Alerte immédiate pour chaque ticket Shein/Temu déposé.</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-stone-200 bg-white hover:bg-stone-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.telegram?.notifyGroupBuys ?? true}
                    onChange={(e) => setSettings({
                      ...settings,
                      telegram: { ...settings.telegram, notifyGroupBuys: e.target.checked }
                    })}
                    className="mt-0.5 rounded text-sky-600 focus:ring-sky-500"
                  />
                  <div>
                    <span className="font-bold text-xs text-stone-900 block">Ventes en Groupe</span>
                    <span className="text-[11px] text-stone-500">Alerte à chaque réservation de client sur un achat groupé.</span>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3.5 rounded-2xl border border-stone-200 bg-white hover:bg-stone-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.telegram?.notifyPayments ?? true}
                    onChange={(e) => setSettings({
                      ...settings,
                      telegram: { ...settings.telegram, notifyPayments: e.target.checked }
                    })}
                    className="mt-0.5 rounded text-sky-600 focus:ring-sky-500"
                  />
                  <div>
                    <span className="font-bold text-xs text-stone-900 block">Paiements & Suivi Colis</span>
                    <span className="text-[11px] text-stone-500">Alerte lors des acomptes reçus et étapes de transit.</span>
                  </div>
                </label>
              </div>
            </div>

            {/* TEST DE CONNEXION */}
            <div className="p-5 rounded-2xl bg-sky-50/60 border border-sky-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-stone-900 text-xs sm:text-sm flex items-center gap-2">
                    <Radio className="w-4 h-4 text-sky-600 animate-pulse" />
                    Tester la connexion du Bot Telegram
                  </h4>
                  <p className="text-xs text-stone-600">
                    Envoie un message de test immédiat vers votre compte Telegram pour valider votre configuration.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleTestTelegram}
                  disabled={testingTelegram || !settings.telegram?.botToken || !settings.telegram?.chatId}
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 transition-all cursor-pointer shadow-xs"
                >
                  <Send className={`w-3.5 h-3.5 ${testingTelegram ? 'animate-spin' : ''}`} />
                  <span>{testingTelegram ? 'Test en cours...' : 'Envoyer un message test'}</span>
                </button>
              </div>

              {/* Résultat du test */}
              {telegramTestResult && (
                <div className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 animate-fade-in ${
                  telegramTestResult.success 
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' 
                    : 'bg-rose-50 text-rose-900 border border-rose-200'
                }`}>
                  {telegramTestResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold block">{telegramTestResult.message}</span>
                    {telegramTestResult.botName && (
                      <span className="text-[11px] text-emerald-700 block mt-0.5">
                        Bot connecté : <strong>{telegramTestResult.botName}</strong> (@{telegramTestResult.botUsername})
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* SECTION PILOTAGE & COMMANDES TELEGRAM (MANAGEMENT) */}
            <div className="p-6 rounded-3xl bg-stone-900 text-stone-100 space-y-4">
              <div className="flex items-center gap-2.5 border-b border-stone-800 pb-3">
                <Terminal className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-white text-base">
                  Gestion & Pilotage interactif par Telegram (Commandes Bot)
                </h3>
              </div>

              <p className="text-xs text-stone-300 leading-relaxed">
                Vous pouvez envoyer des commandes directement à votre bot Telegram pour consulter les commandes et modifier les statuts des colis à tout moment sans ouvrir le navigateur :
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700 space-y-1">
                  <code className="text-emerald-400 font-bold font-mono">/stats</code>
                  <p className="text-stone-300 text-[11px]">Affiche le nombre de commandes en cours, devis en attente et ventes groupées.</p>
                </div>

                <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700 space-y-1">
                  <code className="text-emerald-400 font-bold font-mono">/tickets</code>
                  <p className="text-stone-300 text-[11px]">Liste les 5 dernières commandes récentes avec leurs statuts et montants.</p>
                </div>

                <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700 space-y-1">
                  <code className="text-emerald-400 font-bold font-mono">/ticket CS-652190</code>
                  <p className="text-stone-300 text-[11px]">Consulte la fiche complète d'une commande (articles, prix, client).</p>
                </div>

                <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700 space-y-1">
                  <code className="text-emerald-400 font-bold font-mono">/ventes</code>
                  <p className="text-stone-300 text-[11px]">Affiche l'avancement et les réservations des ventes groupées.</p>
                </div>

                <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700 space-y-1 col-span-1 sm:col-span-2">
                  <code className="text-emerald-400 font-bold font-mono">/status [ID] [statut]</code>
                  <p className="text-stone-300 text-[11px]">
                    Change le statut d'un colis en 1 message ! Ex: <code>/status CS-652190 commande_passee</code> ou <code>colis_arrive</code>.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-800 text-[11px] text-stone-400">
                🔗 <strong>URL du Webhook Telegram :</strong> <code>https://votre-domaine.com/api/telegram/webhook</code>
              </div>
            </div>

            {/* GUIDE RAPIDE D'INSTALLATION EN 3 ÉTAPES */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-stone-900 text-sm border-l-4 border-amber-500 pl-3">
                Guide en 3 étapes pour créer votre Bot Telegram :
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                  <div className="w-7 h-7 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center">1</div>
                  <h4 className="font-bold text-xs text-stone-900">Créer le bot sur Telegram</h4>
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    Ouvrez Telegram, cherchez <strong>@BotFather</strong>, tapez <code>/newbot</code>, donnez un nom à votre bot (ex: <em>Christaline Shop Alert</em>). Copiez le <strong>Token</strong> généré.
                  </p>
                </div>

                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                  <div className="w-7 h-7 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center">2</div>
                  <h4 className="font-bold text-xs text-stone-900">Démarrer une conversation</h4>
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    Cherchez votre nouveau bot sur Telegram et cliquez impérativement sur <strong>« Démarrer »</strong> (ou ajoutez-le à votre groupe de gestion).
                  </p>
                </div>

                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                  <div className="w-7 h-7 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center">3</div>
                  <h4 className="font-bold text-xs text-stone-900">Obtenir votre Chat ID</h4>
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    Cherchez <strong>@userinfobot</strong> sur Telegram pour voir instantanément votre <strong>Id</strong> (ex: <code>987654321</code>). Collez-le ci-dessus puis cliquez sur « Tester ».
                  </p>
                </div>
              </div>
            </div>

            {/* BOUTON D'ENREGISTREMENT */}
            <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-stone-500">
                Sauvegardez vos identifiants pour activer immédiatement les notifications Telegram.
              </p>
              <button
                type="button"
                onClick={() => saveSettingsToServer(settings)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-black text-sm shadow-md cursor-pointer transition-transform hover:scale-102"
              >
                <Save className="w-4 h-4" />
                <span>Enregistrer la Configuration Telegram</span>
              </button>
            </div>

          </div>
        )}

        {/* ============================================================ */}
        {/* ONGLET 6 : MARKETING, PIXELS (FB & TIKTOK) & STATISTIQUES */}
        {/* ============================================================ */}
        {activeAdminTab === 'marketing' && settings && (
          <div className="space-y-8 animate-fade-in">
            
            {/* EN-TÊTE PRINCIPAL */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-purple-200 shrink-0">
                  <TrendingUp className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-serif">
                      Marketing, Pixels & Statistiques de Tracking
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                      Bénin Tracking
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-500 mt-1">
                    Mesurez vos publicités Facebook Ads & TikTok Ads, analysez votre trafic et maximisez vos conversions de commandes.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={fetchAnalytics}
                  disabled={loadingAnalytics}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
                  title="Rafraîchir les données"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingAnalytics ? 'animate-spin' : ''}`} />
                  <span>Actualiser stats</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetAnalytics}
                  className="px-3.5 py-2.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Remettre les statistiques à zéro"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Réinitialiser</span>
                </button>
              </div>
            </div>

            {/* SOUS-NAVIGATION MARKETING */}
            <div className="flex items-center gap-2 border-b border-stone-200 pb-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setMarketingSubTab('overview')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                  marketingSubTab === 'overview'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Tableau de Bord & Tunnel</span>
              </button>

              <button
                onClick={() => setMarketingSubTab('pixels')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                  marketingSubTab === 'pixels'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <Target className="w-4 h-4" />
                <span>Pixels Publicitaires (Facebook & TikTok)</span>
                {(settings.marketing?.facebookPixel?.enabled || settings.marketing?.tiktokPixel?.enabled) && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                )}
              </button>

              <button
                onClick={() => setMarketingSubTab('utm')}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                  marketingSubTab === 'utm'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <Link2 className="w-4 h-4" />
                <span>Générateur de Liens de Campagne (UTM)</span>
              </button>
            </div>

            {/* SOUS-ONGLET 1 : VUE D'ENSEMBLE & TUNNEL */}
            {marketingSubTab === 'overview' && (
              <div className="space-y-8 animate-fade-in">
                
                {/* 5 KPIs CLÉS */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                  {/* KPI 1 : Visites Totales */}
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs">
                    <div className="flex items-center justify-between text-stone-400 text-xs font-bold uppercase">
                      <span>Total Visites</span>
                      <Globe className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-stone-900 mt-2 font-mono">
                      {analyticsSummary?.totalVisits || 0}
                    </div>
                    <div className="text-[11px] text-stone-500 mt-1 flex items-center gap-1">
                      <span className="font-bold text-emerald-600">+{analyticsSummary?.todayVisits || 0}</span>
                      <span>aujourd'hui</span>
                    </div>
                  </div>

                  {/* KPI 2 : Devis Demandés (Leads) */}
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-rose-200 shadow-2xs bg-rose-50/20">
                    <div className="flex items-center justify-between text-rose-700 text-xs font-bold uppercase">
                      <span>Devis / Précommandes</span>
                      <ShoppingBag className="w-4 h-4 text-rose-500" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-rose-700 mt-2 font-mono">
                      {analyticsSummary?.totalLeads || 0}
                    </div>
                    <div className="text-[11px] text-rose-600 font-medium mt-1">
                      Leads Shein & Temu
                    </div>
                  </div>

                  {/* KPI 3 : Réservations Ventes Groupées */}
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-200 shadow-2xs bg-amber-50/20">
                    <div className="flex items-center justify-between text-amber-700 text-xs font-bold uppercase">
                      <span>Ventes Groupées</span>
                      <Users className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-amber-800 mt-2 font-mono">
                      {analyticsSummary?.totalGroupBuyReservations || 0}
                    </div>
                    <div className="text-[11px] text-amber-700 font-medium mt-1">
                      Réservations validées
                    </div>
                  </div>

                  {/* KPI 4 : Taux de Conversion */}
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-200 shadow-2xs bg-emerald-50/20">
                    <div className="flex items-center justify-between text-emerald-700 text-xs font-bold uppercase">
                      <span>Taux de Conversion</span>
                      <Percent className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-2 font-mono">
                      {analyticsSummary?.conversionRate || 0}%
                    </div>
                    <div className="text-[11px] text-emerald-600 font-medium mt-1">
                      (Commandes / Visites)
                    </div>
                  </div>

                  {/* KPI 5 : Clics WhatsApp / Contact */}
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-blue-200 shadow-2xs bg-blue-50/20 col-span-2 lg:col-span-1">
                    <div className="flex items-center justify-between text-blue-700 text-xs font-bold uppercase">
                      <span>Prises de Contact</span>
                      <MessageCircle className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-blue-700 mt-2 font-mono">
                      {(analyticsSummary?.totalWhatsappClicks || 0) + (analyticsSummary?.totalPhoneClicks || 0)}
                    </div>
                    <div className="text-[11px] text-blue-600 font-medium mt-1 flex items-center justify-between">
                      <span>WhatsApp : {analyticsSummary?.totalWhatsappClicks || 0}</span>
                      <span>Appels : {analyticsSummary?.totalPhoneClicks || 0}</span>
                    </div>
                  </div>
                </div>

                {/* TUNNEL DE CONVERSION MARKETING (FUNNEL) */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black text-stone-900 font-serif flex items-center gap-2">
                        <Target className="w-5 h-5 text-rose-600" />
                        <span>Tunnel de Conversion Publicitaire (Bénin)</span>
                      </h3>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Progression de vos visiteurs depuis l'arrivée sur le site jusqu'à la commande finale.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-stone-400">
                      Total événements : {((analyticsSummary?.totalVisits || 0) + (analyticsSummary?.totalLeads || 0) + (analyticsSummary?.totalGroupBuyReservations || 0))}
                    </span>
                  </div>

                  {/* Étapes du tunnel */}
                  <div className="space-y-4">
                    {analyticsSummary?.funnel?.map((step, idx) => {
                      const totalVisits = analyticsSummary.totalVisits || 1;
                      const percentage = Math.min(100, Math.round((step.count / totalVisits) * 100));
                      const colors = [
                        'from-purple-600 to-indigo-600',
                        'from-blue-600 to-cyan-600',
                        'from-rose-600 to-pink-600',
                        'from-amber-500 to-orange-500',
                        'from-emerald-600 to-teal-600'
                      ];

                      return (
                        <div key={step.step} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs sm:text-sm">
                            <span className="font-bold text-stone-800">{step.label}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-stone-900">{step.count} action{step.count > 1 ? 's' : ''}</span>
                              <span className="text-xs text-stone-400 font-mono">({percentage}%)</span>
                            </div>
                          </div>
                          <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden p-0.5 border border-stone-200">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${colors[idx % colors.length]} transition-all duration-700`}
                              style={{ width: `${Math.max(4, percentage)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2 COLONNES : SOURCES D'ACQUISITION & TOP CAMPAGNES */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* COLONNE 1 : RÉPARTITION DES SOURCES (UTM SOURCE) */}
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                      <div>
                        <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
                          <Share2 className="w-4 h-4 text-purple-600" />
                          <span>Sources d'Acquisition de Trafic</span>
                        </h3>
                        <p className="text-xs text-stone-500 mt-0.5">D'où viennent vos clients au Bénin ?</p>
                      </div>
                    </div>

                    {(!analyticsSummary?.sourcesBreakdown || analyticsSummary.sourcesBreakdown.length === 0) ? (
                      <div className="p-8 text-center text-stone-400 text-xs">
                        Aucune source enregistrée pour le moment.
                      </div>
                    ) : (
                      <div className="space-y-3.5">
                        {analyticsSummary.sourcesBreakdown.map((src) => {
                          let badgeBg = 'bg-stone-100 text-stone-800';
                          let label = src.source.toUpperCase();
                          if (src.source === 'facebook') {
                            badgeBg = 'bg-blue-600 text-white';
                            label = 'Facebook Ads';
                          } else if (src.source === 'tiktok') {
                            badgeBg = 'bg-stone-900 text-white';
                            label = 'TikTok Ads';
                          } else if (src.source === 'whatsapp') {
                            badgeBg = 'bg-emerald-600 text-white';
                            label = 'WhatsApp (Groupes / Statuts)';
                          } else if (src.source === 'instagram') {
                            badgeBg = 'bg-gradient-to-r from-pink-500 to-rose-600 text-white';
                            label = 'Instagram';
                          } else if (src.source === 'google') {
                            badgeBg = 'bg-amber-500 text-white';
                            label = 'Google Recherche';
                          } else if (src.source === 'direct') {
                            badgeBg = 'bg-stone-200 text-stone-700';
                            label = 'Direct / Bouche à oreille';
                          }

                          return (
                            <div key={src.source} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${badgeBg}`}>
                                  {label}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-stone-900">{src.count} visite{src.count > 1 ? 's' : ''}</span>
                                  <span className="text-stone-400 font-mono text-[11px]">({src.percentage}%)</span>
                                </div>
                              </div>
                              <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-purple-600 rounded-full"
                                  style={{ width: `${Math.max(5, src.percentage)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* COLONNE 2 : TOP CAMPAGNES PUBLICITAIRES */}
                  <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                      <div>
                        <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
                          <Target className="w-4 h-4 text-rose-600" />
                          <span>Campagnes Publicitaires Détectées</span>
                        </h3>
                        <p className="text-xs text-stone-500 mt-0.5">Performances par tag `utm_campaign`</p>
                      </div>
                    </div>

                    {(!analyticsSummary?.campaignsBreakdown || analyticsSummary.campaignsBreakdown.length === 0) ? (
                      <div className="p-8 text-center text-stone-400 text-xs space-y-2">
                        <p>Aucune campagne UTM spécifique détectée pour l'instant.</p>
                        <p className="text-[11px] text-stone-500">
                          Utilisez l'onglet <strong>« Générateur UTM »</strong> pour créer vos premiers liens publicitaires Facebook Ads & TikTok Ads.
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-stone-100">
                        {analyticsSummary.campaignsBreakdown.map((camp) => (
                          <div key={camp.campaign} className="py-2.5 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 font-bold text-stone-800">
                              <span className="text-purple-600">🎯</span>
                              <span className="font-mono">{camp.campaign}</span>
                            </div>
                            <span className="font-mono font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded-md">
                              {camp.count} clics
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

                {/* JOURNAL DES ÉVÉNEMENTS RÉCENTS (LIVE STREAM) */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                    <div>
                      <h3 className="text-base font-black text-stone-900">
                        Flux en Direct des Dernières Actions (30 plus récentes)
                      </h3>
                      <p className="text-xs text-stone-500 mt-0.5">Historique chronologique des événements clients</p>
                    </div>
                  </div>

                  {(!analyticsSummary?.recentEvents || analyticsSummary.recentEvents.length === 0) ? (
                    <div className="p-8 text-center text-stone-400 text-xs">
                      Aucune activité enregistrée pour le moment.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-stone-100 text-stone-700 uppercase text-[10px] tracking-wider font-bold">
                          <tr>
                            <th className="p-3 rounded-l-xl">Heure / Date</th>
                            <th className="p-3">Événement</th>
                            <th className="p-3">Page</th>
                            <th className="p-3">Source UTM</th>
                            <th className="p-3">Appareil</th>
                            <th className="p-3 rounded-r-xl">Détails</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                          {analyticsSummary.recentEvents.map((ev) => {
                            const dateStr = new Date(ev.timestamp).toLocaleString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            });

                            let badge = <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded-full text-[10px] font-bold">Visite</span>;
                            if (ev.type === 'lead_quote') {
                              badge = <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full text-[10px] font-bold">🎫 Devis Demandé</span>;
                            } else if (ev.type === 'group_buy_joined') {
                              badge = <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full text-[10px] font-bold">🛒 Réservation Groupe</span>;
                            } else if (ev.type === 'whatsapp_click') {
                              badge = <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">💬 Clic WhatsApp</span>;
                            } else if (ev.type === 'phone_click') {
                              badge = <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-[10px] font-bold">📞 Appel</span>;
                            } else if (ev.type === 'initiate_checkout') {
                              badge = <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-[10px] font-bold">⚡ Début Commande</span>;
                            }

                            return (
                              <tr key={ev.id} className="hover:bg-stone-50/80">
                                <td className="p-3 font-mono text-[11px] text-stone-500 whitespace-nowrap">
                                  {dateStr}
                                </td>
                                <td className="p-3">
                                  {badge}
                                </td>
                                <td className="p-3 font-mono text-[11px] text-stone-600">
                                  {ev.path}
                                </td>
                                <td className="p-3">
                                  <span className="font-bold text-stone-800 uppercase text-[10px] bg-stone-100 px-1.5 py-0.5 rounded">
                                    {ev.utmSource || 'direct'}
                                  </span>
                                  {ev.utmCampaign && (
                                    <span className="text-[10px] text-purple-600 block font-mono">
                                      {ev.utmCampaign}
                                    </span>
                                  )}
                                </td>
                                <td className="p-3 text-[11px] text-stone-500">
                                  {ev.deviceType === 'mobile' ? '📱 Mobile' : '💻 Ordinateur'}
                                </td>
                                <td className="p-3 text-[11px] text-stone-600">
                                  {ev.metadata?.ticketId && (
                                    <span className="font-mono text-rose-600 font-bold">Ticket: {ev.metadata.ticketId}</span>
                                  )}
                                  {ev.metadata?.itemTitle && (
                                    <span className="line-clamp-1">{ev.metadata.itemTitle} ({ev.metadata.amountCFA} FCFA)</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* SOUS-ONGLET 2 : CONFIGURATION DES PIXELS (FACEBOOK, TIKTOK, GOOGLE) */}
            {marketingSubTab === 'pixels' && (
              <div className="space-y-8 animate-fade-in">
                
                {marketingSuccess && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in shadow-xs">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Configuration des Pixels enregistrée avec succès ! Les scripts sont immédiatement opérationnels sur le site.</span>
                  </div>
                )}

                {/* 1. PIXEL META / FACEBOOK ADS */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-blue-200 shrink-0">
                        f
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-black text-stone-900">
                            Pixel Meta (Facebook Ads & Instagram Ads)
                          </h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            settings.marketing?.facebookPixel?.enabled && settings.marketing?.facebookPixel?.pixelId
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-stone-100 text-stone-600 border border-stone-200'
                          }`}>
                            {settings.marketing?.facebookPixel?.enabled && settings.marketing?.facebookPixel?.pixelId ? '🟢 Connecté' : '⚪ Désactivé'}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">
                          Injecte automatiquement la balise officielle Meta Pixel (`fbq`) et transmet tous les événements de conversion.
                        </p>
                      </div>
                    </div>

                    {/* Toggle ON/OFF */}
                    <button
                      type="button"
                      onClick={() => setSettings({
                        ...settings,
                        marketing: {
                          ...settings.marketing,
                          facebookPixel: {
                            ...settings.marketing?.facebookPixel,
                            enabled: !settings.marketing?.facebookPixel?.enabled
                          }
                        }
                      })}
                      className="cursor-pointer"
                    >
                      {settings.marketing?.facebookPixel?.enabled ? (
                        <ToggleRight className="w-10 h-10 text-emerald-600 transition-colors" />
                      ) : (
                        <ToggleLeft className="w-10 h-10 text-stone-400 transition-colors" />
                      )}
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                        <span>Identifiant du Pixel Meta (Pixel ID) *</span>
                        <span className="text-[10px] text-stone-500 font-normal">Disponible dans le Gestionnaire d'Événements Meta</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: 849201938201928"
                        value={settings.marketing?.facebookPixel?.pixelId || ''}
                        onChange={(e) => setSettings({
                          ...settings,
                          marketing: {
                            ...settings.marketing,
                            facebookPixel: {
                              ...settings.marketing?.facebookPixel,
                              pixelId: e.target.value.trim()
                            }
                          }
                        })}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-300 font-mono text-sm bg-stone-50 focus:bg-white"
                      />
                    </div>

                    {/* Grille des événements Meta trackés */}
                    <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 text-xs">
                      <span className="font-bold text-stone-800 block">Événements Meta automatiquement pris en charge :</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-stone-600">
                        <div className="bg-white p-2 rounded-lg border border-stone-200">
                          <code className="text-blue-600 font-bold">PageView</code>
                          <p className="text-stone-400 text-[10px] mt-0.5">Navigation sur le site</p>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-stone-200">
                          <code className="text-blue-600 font-bold">ViewContent</code>
                          <p className="text-stone-400 text-[10px] mt-0.5">Consultation vente groupée</p>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-stone-200">
                          <code className="text-blue-600 font-bold">InitiateCheckout</code>
                          <p className="text-stone-400 text-[10px] mt-0.5">Ouverture du formulaire</p>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-stone-200">
                          <code className="text-blue-600 font-bold">Lead</code>
                          <p className="text-stone-400 text-[10px] mt-0.5">Ticket précommande généré</p>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-stone-200">
                          <code className="text-blue-600 font-bold">Purchase</code>
                          <p className="text-stone-400 text-[10px] mt-0.5">Vente groupe réservée (CFA)</p>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-stone-200">
                          <code className="text-blue-600 font-bold">Contact</code>
                          <p className="text-stone-400 text-[10px] mt-0.5">Clic WhatsApp ou Appel</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. PIXEL TIKTOK ADS */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center font-black text-xl shadow-md shadow-stone-300 shrink-0">
                        🎵
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-black text-stone-900">
                            Pixel TikTok Ads
                          </h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            settings.marketing?.tiktokPixel?.enabled && settings.marketing?.tiktokPixel?.pixelId
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-stone-100 text-stone-600 border border-stone-200'
                          }`}>
                            {settings.marketing?.tiktokPixel?.enabled && settings.marketing?.tiktokPixel?.pixelId ? '🟢 Connecté' : '⚪ Désactivé'}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">
                          Injecte la balise officielle TikTok Analytics (`ttq`) pour le suivi des vidéos sponsorisées.
                        </p>
                      </div>
                    </div>

                    {/* Toggle ON/OFF */}
                    <button
                      type="button"
                      onClick={() => setSettings({
                        ...settings,
                        marketing: {
                          ...settings.marketing,
                          tiktokPixel: {
                            ...settings.marketing?.tiktokPixel,
                            enabled: !settings.marketing?.tiktokPixel?.enabled
                          }
                        }
                      })}
                      className="cursor-pointer"
                    >
                      {settings.marketing?.tiktokPixel?.enabled ? (
                        <ToggleRight className="w-10 h-10 text-emerald-600 transition-colors" />
                      ) : (
                        <ToggleLeft className="w-10 h-10 text-stone-400 transition-colors" />
                      )}
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                        <span>Identifiant du Pixel TikTok (Pixel ID) *</span>
                        <span className="text-[10px] text-stone-500 font-normal">Disponible dans TikTok Ads Manager</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: C8V49KBC77U872XXXXXX"
                        value={settings.marketing?.tiktokPixel?.pixelId || ''}
                        onChange={(e) => setSettings({
                          ...settings,
                          marketing: {
                            ...settings.marketing,
                            tiktokPixel: {
                              ...settings.marketing?.tiktokPixel,
                              pixelId: e.target.value.trim()
                            }
                          }
                        })}
                        className="w-full px-4 py-2.5 rounded-xl border border-stone-300 font-mono text-sm bg-stone-50 focus:bg-white"
                      />
                    </div>

                    {/* Grille des événements TikTok trackés */}
                    <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 text-xs">
                      <span className="font-bold text-stone-800 block">Événements TikTok automatiquement pris en charge :</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-stone-600">
                        <div className="bg-white p-2 rounded-lg border border-stone-200">
                          <code className="text-black font-bold">PageView</code>
                          <p className="text-stone-400 text-[10px] mt-0.5">Visites de pages</p>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-stone-200">
                          <code className="text-black font-bold">InitiateCheckout</code>
                          <p className="text-stone-400 text-[10px] mt-0.5">Ouverture formulaire</p>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-stone-200">
                          <code className="text-black font-bold">SubmitForm</code>
                          <p className="text-stone-400 text-[10px] mt-0.5">Demande de devis soumise</p>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-stone-200">
                          <code className="text-black font-bold">CompletePayment</code>
                          <p className="text-stone-400 text-[10px] mt-0.5">Réservation vente groupe</p>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-stone-200">
                          <code className="text-black font-bold">Contact</code>
                          <p className="text-stone-400 text-[10px] mt-0.5">WhatsApp / Appel</p>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-stone-200">
                          <code className="text-black font-bold">ViewContent</code>
                          <p className="text-stone-400 text-[10px] mt-0.5">Fiche produit groupé</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. GOOGLE ANALYTICS (OPTIONNEL) */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black text-xl shadow-md shadow-amber-200 shrink-0">
                        G
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-black text-stone-900">
                            Google Analytics 4 (Optionnel)
                          </h3>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            settings.marketing?.googleAnalytics?.enabled && settings.marketing?.googleAnalytics?.measurementId
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-stone-100 text-stone-600 border border-stone-200'
                          }`}>
                            {settings.marketing?.googleAnalytics?.enabled && settings.marketing?.googleAnalytics?.measurementId ? '🟢 Connecté' : '⚪ Désactivé'}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">
                          Injecte `gtag.js` pour analyser les statistiques avancées dans Google Analytics.
                        </p>
                      </div>
                    </div>

                    {/* Toggle ON/OFF */}
                    <button
                      type="button"
                      onClick={() => setSettings({
                        ...settings,
                        marketing: {
                          ...settings.marketing,
                          googleAnalytics: {
                            ...settings.marketing?.googleAnalytics,
                            enabled: !settings.marketing?.googleAnalytics?.enabled
                          }
                        }
                      })}
                      className="cursor-pointer"
                    >
                      {settings.marketing?.googleAnalytics?.enabled ? (
                        <ToggleRight className="w-10 h-10 text-emerald-600 transition-colors" />
                      ) : (
                        <ToggleLeft className="w-10 h-10 text-stone-400 transition-colors" />
                      )}
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>ID de mesure Google Analytics (Measurement ID)</span>
                      <span className="text-[10px] text-stone-500 font-normal">Ex: G-XXXXXXXXXX</span>
                    </label>
                    <input
                      type="text"
                      placeholder="G-XXXXXXXXXX"
                      value={settings.marketing?.googleAnalytics?.measurementId || ''}
                      onChange={(e) => setSettings({
                        ...settings,
                        marketing: {
                          ...settings.marketing,
                          googleAnalytics: {
                            ...settings.marketing?.googleAnalytics,
                            measurementId: e.target.value.trim()
                          }
                        }
                      })}
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-300 font-mono text-sm bg-stone-50 focus:bg-white"
                    />
                  </div>
                </div>

                {/* BOUTON D'ENREGISTREMENT PIXELS */}
                <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs text-stone-500">
                    Les modifications des pixels sont appliquées instantanément à tous les visiteurs sans redémarrage.
                  </p>
                  <button
                    type="button"
                    onClick={async () => {
                      await saveSettingsToServer(settings);
                      setMarketingSuccess(true);
                      setTimeout(() => setMarketingSuccess(false), 3500);
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-700 hover:to-rose-700 text-white font-black text-sm shadow-md cursor-pointer transition-transform hover:scale-102"
                  >
                    <Save className="w-4 h-4" />
                    <span>Enregistrer la Configuration des Pixels</span>
                  </button>
                </div>

              </div>
            )}

            {/* SOUS-ONGLET 3 : GÉNÉRATEUR D'URL DE CAMPAGNE (UTM BUILDER) */}
            {marketingSubTab === 'utm' && (
              <div className="space-y-8 animate-fade-in">
                
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-stone-900 font-serif flex items-center gap-2">
                      <Link2 className="w-5 h-5 text-purple-600" />
                      <span>Générateur d'URLs de Campagne (UTM Builder Bénin)</span>
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">
                      Générez des liens personnalisés pour vos publicités Facebook Ads, TikTok Ads, statuts WhatsApp ou partenariats influenceurs.
                      Chaque clic sera tracé avec précision dans vos statistiques !
                    </p>
                  </div>

                  {/* FORMULAIRE UTM */}
                  <div className="space-y-5">
                    
                    {/* 1. Page Cible */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                        1. Page de destination sur Christaline Shop :
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setUtmTargetPage('/')}
                          className={`p-3 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                            utmTargetPage === '/'
                              ? 'border-purple-600 bg-purple-50 text-purple-900 ring-2 ring-purple-600/20'
                              : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                          }`}
                        >
                          <span className="block text-sm">🏠 Page d'Accueil</span>
                          <span className="text-[11px] font-normal text-stone-500 mt-0.5 block">Formulaire de devis Shein / Temu</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setUtmTargetPage('/ventes-groupees')}
                          className={`p-3 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                            utmTargetPage === '/ventes-groupees'
                              ? 'border-purple-600 bg-purple-50 text-purple-900 ring-2 ring-purple-600/20'
                              : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                          }`}
                        >
                          <span className="block text-sm">🔥 Ventes en Groupe</span>
                          <span className="text-[11px] font-normal text-stone-500 mt-0.5 block">Articles groupés à prix réduits</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setUtmTargetPage('/suivi')}
                          className={`p-3 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                            utmTargetPage === '/suivi'
                              ? 'border-purple-600 bg-purple-50 text-purple-900 ring-2 ring-purple-600/20'
                              : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                          }`}
                        >
                          <span className="block text-sm">📦 Suivi de Colis</span>
                          <span className="text-[11px] font-normal text-stone-500 mt-0.5 block">Recherche par N° de ticket</span>
                        </button>
                      </div>
                    </div>

                    {/* 2. Préréglages rapides de source */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                        2. Sélection rapide du canal publicitaire :
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => { setUtmSource('facebook'); setUtmMedium('ads'); }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                            utmSource === 'facebook' && utmMedium === 'ads'
                              ? 'bg-blue-600 text-white'
                              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                          }`}
                        >
                          <span>📘 Facebook Ads</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => { setUtmSource('tiktok'); setUtmMedium('ads'); }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                            utmSource === 'tiktok' && utmMedium === 'ads'
                              ? 'bg-black text-white'
                              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                          }`}
                        >
                          <span>🎵 TikTok Ads</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => { setUtmSource('whatsapp'); setUtmMedium('statut'); }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                            utmSource === 'whatsapp' && utmMedium === 'statut'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                          }`}
                        >
                          <span>💬 Statut WhatsApp</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => { setUtmSource('whatsapp'); setUtmMedium('groupe_vip'); }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                            utmSource === 'whatsapp' && utmMedium === 'groupe_vip'
                              ? 'bg-emerald-700 text-white'
                              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                          }`}
                        >
                          <span>👥 Groupe VIP WhatsApp</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => { setUtmSource('instagram'); setUtmMedium('bio'); }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                            utmSource === 'instagram' && utmMedium === 'bio'
                              ? 'bg-rose-600 text-white'
                              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                          }`}
                        >
                          <span>📸 Instagram Bio</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => { setUtmSource('influenceur'); setUtmMedium('partenariat'); }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                            utmSource === 'influenceur'
                              ? 'bg-amber-600 text-white'
                              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                          }`}
                        >
                          <span>⭐ Influenceur Bénin</span>
                        </button>
                      </div>
                    </div>

                    {/* 3. Paramètres détaillés */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                          Source (utm_source)
                        </label>
                        <input
                          type="text"
                          value={utmSource}
                          onChange={(e) => setUtmSource(e.target.value.toLowerCase().trim())}
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 font-mono text-xs bg-white"
                          placeholder="facebook, tiktok, whatsapp..."
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                          Support (utm_medium)
                        </label>
                        <input
                          type="text"
                          value={utmMedium}
                          onChange={(e) => setUtmMedium(e.target.value.toLowerCase().trim())}
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 font-mono text-xs bg-white"
                          placeholder="ads, statut, story, cpc..."
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1">
                          Nom de Campagne (utm_campaign)
                        </label>
                        <input
                          type="text"
                          value={utmCampaign}
                          onChange={(e) => setUtmCampaign(e.target.value.toLowerCase().trim())}
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 font-mono text-xs bg-white"
                          placeholder="promo-shein-benin, soldes..."
                        />
                      </div>
                    </div>

                    {/* 4. Lien Généré avec bouton Copier */}
                    {(() => {
                      const domain = typeof window !== 'undefined' ? window.location.origin : 'https://christaline.shop';
                      const finalUrl = `${domain}${utmTargetPage}?utm_source=${encodeURIComponent(utmSource || 'direct')}&utm_medium=${encodeURIComponent(utmMedium || 'cpc')}&utm_campaign=${encodeURIComponent(utmCampaign || 'campagne')}`;

                      return (
                        <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                              Votre lien de campagne publicitaire généré :
                            </span>
                            <span className="text-[11px] text-purple-700 font-mono">
                              Prêt pour vos annonces
                            </span>
                          </div>

                          <div className="p-3 bg-white rounded-xl border border-purple-200 font-mono text-xs text-purple-950 break-all select-all">
                            {finalUrl}
                          </div>

                          <div className="flex items-center justify-end gap-3 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(finalUrl);
                                setCopiedUtm(true);
                                setTimeout(() => setCopiedUtm(false), 2500);
                              }}
                              className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs flex items-center gap-2 shadow-md shadow-purple-200 transition-all cursor-pointer"
                            >
                              {copiedUtm ? (
                                <>
                                  <Check className="w-4 h-4" />
                                  <span>Lien copié dans le presse-papier !</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4" />
                                  <span>Copier le lien publicitaire</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })()}

                  </div>
                </div>

              </div>
            )}

          </div>
        )}

        {/* ============================================================ */}
        {/* ONGLET : VENTES EN GROUPE (ACHATS GROUPÉS) */}
        {/* ============================================================ */}
        {activeAdminTab === 'group_buys' && (
          <div className="space-y-8">
            
            {/* EN-TÊTE DE SECTION & STATS */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200">
                  Commandes Groupées
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-serif mt-1">
                  Gestion des Ventes en Groupe
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Articles vedettes proposés aux clients pour commander ensemble à tarif réduit avec date de commande et quantité minimum.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/ventes-groupees"
                  target="_blank"
                  className="px-4 py-2.5 rounded-xl border border-stone-200 hover:border-rose-300 text-stone-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-rose-500" />
                  <span>Voir la page publique</span>
                </Link>

                <button
                  onClick={handleOpenCreateGb}
                  className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-black text-xs rounded-xl shadow-md shadow-rose-200 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter un Article</span>
                </button>
              </div>
            </div>

            {/* Notification de succès */}
            {gbSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Article de vente en groupe enregistré avec succès !</span>
              </div>
            )}

            {/* STATS RAPIDES VENTES GROUPÉES */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
                <div className="text-stone-400 text-xs font-bold uppercase">Total Articles</div>
                <div className="text-2xl font-black text-stone-900 mt-1">{groupBuys.length}</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
                <div className="text-rose-600 text-xs font-bold uppercase">En cours de réservation</div>
                <div className="text-2xl font-black text-rose-600 mt-1">
                  {groupBuys.filter(g => g.status === 'open').length}
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
                <div className="text-emerald-600 text-xs font-bold uppercase">Objectif Atteint (Confirmées)</div>
                <div className="text-2xl font-black text-emerald-600 mt-1">
                  {groupBuys.filter(g => g.status === 'goal_reached').length}
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
                <div className="text-amber-600 text-xs font-bold uppercase">Total Réservations Clients</div>
                <div className="text-2xl font-black text-amber-600 mt-1">
                  {groupBuys.reduce((acc, g) => acc + (g.participants?.length || 0), 0)} clients
                </div>
              </div>
            </div>

            {/* LISTE DES VENTES GROUPÉES */}
            {groupBuys.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-3">
                <Users className="w-12 h-12 text-stone-300 mx-auto" />
                <h3 className="text-lg font-bold text-stone-800">Aucune vente groupée enregistrée</h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Cliquez sur "Ajouter un Article" pour créer votre première offre de vente en groupe.
                </p>
                <button
                  onClick={handleOpenCreateGb}
                  className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold"
                >
                  Créer un article
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {groupBuys.map((item) => {
                  const progressPct = Math.min(100, Math.round((item.currentQuantity / item.minQuantity) * 100));

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs hover:border-rose-300 transition-all p-5 flex flex-col justify-between space-y-4"
                    >
                      <div className="flex gap-4">
                        {/* Image */}
                        <div className="w-28 h-28 rounded-2xl overflow-hidden bg-stone-100 shrink-0 relative">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-1 left-1 text-[9px] bg-stone-900/80 text-white font-bold px-1.5 py-0.5 rounded uppercase">
                            {item.platform || 'SHEIN'}
                          </span>
                        </div>

                        {/* Infos clés */}
                        <div className="flex-1 space-y-1.5 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                              {item.shippingMode === 'sea' ? '🚢 Voie Maritime (2-3 mois)' : '✈️ Voie Aérienne (≤ 1 mois)'}
                            </span>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              item.status === 'goal_reached'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.status === 'ordered'
                                ? 'bg-purple-100 text-purple-800'
                                : item.status === 'closed'
                                ? 'bg-stone-100 text-stone-700'
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {item.status === 'goal_reached' ? 'Objectif Atteint' : item.status === 'ordered' ? 'Commande Passée' : item.status === 'closed' ? 'Clôturée' : 'En cours'}
                            </span>
                          </div>

                          <h3 className="font-bold text-stone-900 text-sm sm:text-base truncate">
                            {item.title}
                          </h3>

                          {/* Prix */}
                          <div className="flex items-baseline gap-2">
                            <span className="font-mono font-black text-base text-rose-600">
                              {item.priceCFA.toLocaleString('fr-FR')} FCFA
                            </span>
                            {item.originalPriceCFA && (
                              <span className="text-xs text-stone-400 line-through font-mono">
                                {item.originalPriceCFA.toLocaleString('fr-FR')} FCFA
                              </span>
                            )}
                          </div>

                          {/* Date de commande */}
                          <div className="text-[11px] text-amber-800 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 inline-flex items-center gap-1.5 font-semibold">
                            <Calendar className="w-3 h-3 text-amber-600 shrink-0" />
                            <span>Commande passée le : <strong>{item.orderDate}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Barre de progression & quantité min */}
                      <div className="space-y-1.5 bg-stone-50 p-3 rounded-2xl border border-stone-200">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-stone-600">
                            Quantité réservée : <strong className="text-stone-900 font-mono">{item.currentQuantity}</strong> / {item.minQuantity} pièces
                          </span>
                          <span className="font-mono font-bold text-xs text-stone-700">
                            {progressPct}%
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              item.currentQuantity >= item.minQuantity ? 'bg-emerald-500' : 'bg-rose-600'
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100">
                        {/* Sélecteur de statut rapide */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-stone-400 font-medium">Statut :</span>
                          <select
                            value={item.status}
                            onChange={(e) => handleStatusChangeGb(item.id, e.target.value as GroupBuyStatus)}
                            className="text-xs font-bold px-2 py-1 rounded-lg border border-stone-200 bg-white"
                          >
                            <option value="open">En cours</option>
                            <option value="goal_reached">Objectif Atteint</option>
                            <option value="ordered">Commande Passée</option>
                            <option value="closed">Clôturée</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewingParticipantsGb(item)}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span>Participants ({item.participants?.length || 0})</span>
                          </button>

                          <button
                            onClick={() => handleOpenEditGb(item)}
                            className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors cursor-pointer"
                            title="Modifier"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteGroupBuy(item.id)}
                            className="p-1.5 bg-stone-100 hover:bg-red-50 text-stone-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* ============================================================ */}
        {/* ONGLET : GESTION DES COLIS REÇUS (PREUVES CLIENTS CARROUSEL) */}
        {/* ============================================================ */}
        {activeAdminTab === 'delivered_orders' && (
          <div className="space-y-6">

            {/* Notification de succès */}
            {delSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{delSuccess}</span>
                </div>
                <button onClick={() => setDelSuccess(null)} className="text-emerald-500 hover:text-emerald-700 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* EN-TÊTE DE LA SECTION */}
            <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-[10px] font-black uppercase tracking-wider mb-2 border border-rose-200">
                    <Sparkles className="w-3 h-3 text-rose-500" />
                    <span>Preuves Sociales & Avis Clients (Bénin)</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-stone-900 font-serif">
                    Colis Reçus & Photos Déballages
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl leading-relaxed">
                    Ces photos réelles et témoignages s'affichent instantanément dans le grand carrousel de la page{' '}
                    <strong className="text-stone-700">Suivre mon colis</strong> (/suivi) pour prouver le sérieux de Christaline Shop et rassurer les nouveaux acheteurs béninois.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <Link
                    href="/suivi#colis-recus"
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-50 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
                    <span>Voir sur le site (/suivi)</span>
                  </Link>

                  <button
                    onClick={handleResetDefaultDeliveredOrders}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors cursor-pointer"
                    title="Rétablir les exemples de base"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Réinitialiser exemples</span>
                  </button>

                  <button
                    onClick={handleOpenCreateDelivered}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white text-xs font-black shadow-md shadow-rose-200 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Ajouter une photo de colis</span>
                  </button>
                </div>
              </div>

              {/* STATS RAPIDES */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-stone-100">
                <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-100">
                  <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Total Colis Publiés</div>
                  <div className="text-2xl font-black text-stone-900 mt-0.5">{deliveredOrders.length}</div>
                </div>

                <div className="bg-sky-50/60 p-3.5 rounded-2xl border border-sky-100">
                  <div className="text-[10px] font-bold text-sky-700 uppercase tracking-wider flex items-center gap-1">
                    <Plane className="w-3 h-3 text-sky-600" />
                    <span>Voie Aérienne</span>
                  </div>
                  <div className="text-2xl font-black text-sky-950 mt-0.5">
                    {deliveredOrders.filter(o => o.shippingMode === 'air').length}
                  </div>
                </div>

                <div className="bg-indigo-50/60 p-3.5 rounded-2xl border border-indigo-100">
                  <div className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
                    <Ship className="w-3 h-3 text-indigo-600" />
                    <span>Voie Maritime</span>
                  </div>
                  <div className="text-2xl font-black text-indigo-950 mt-0.5">
                    {deliveredOrders.filter(o => o.shippingMode === 'sea').length}
                  </div>
                </div>

                <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-100">
                  <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                    <span>Satisfaction</span>
                  </div>
                  <div className="text-2xl font-black text-amber-950 mt-0.5">
                    5.0 / 5 ★
                  </div>
                </div>
              </div>
            </div>

            {/* FILTRES & RECHERCHE */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher par client, ville, article ou plateforme..."
                  value={deliveredSearch}
                  onChange={(e) => setDeliveredSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-200 text-xs bg-stone-50/50 focus:bg-white outline-hidden"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                {[
                  { id: 'all', label: 'Tous' },
                  { id: 'shein', label: 'Shein' },
                  { id: 'temu', label: 'Temu' },
                  { id: 'alibaba', label: 'Alibaba' },
                  { id: 'air', label: '✈️ Aérien' },
                  { id: 'sea', label: '🚢 Maritime' }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setDeliveredFilter(f.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      deliveredFilter === f.id
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* LISTE DES COLIS REÇUS */}
            {loadingDeliveredOrders ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-stone-200">
                <RefreshCw className="w-8 h-8 text-rose-500 animate-spin mx-auto mb-3" />
                <p className="text-xs text-stone-500 font-medium">Chargement des colis reçus...</p>
              </div>
            ) : deliveredOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                  <Camera className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-stone-800">Aucun colis reçu pour le moment</h3>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  Ajoutez les premières photos de colis reçus par vos clients ou réinitialisez les exemples de démonstration.
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={handleResetDefaultDeliveredOrders}
                    className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 cursor-pointer"
                  >
                    Charger les exemples
                  </button>
                  <button
                    onClick={handleOpenCreateDelivered}
                    className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 cursor-pointer"
                  >
                    + Ajouter une photo
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {deliveredOrders
                  .filter((order) => {
                    const q = deliveredSearch.toLowerCase();
                    const matchSearch =
                      !deliveredSearch ||
                      order.title.toLowerCase().includes(q) ||
                      order.clientName.toLowerCase().includes(q) ||
                      order.location.toLowerCase().includes(q) ||
                      order.platform.toLowerCase().includes(q) ||
                      (order.ticketId && order.ticketId.toLowerCase().includes(q));

                    if (!matchSearch) return false;
                    if (deliveredFilter === 'all') return true;
                    if (deliveredFilter === 'air') return order.shippingMode === 'air';
                    if (deliveredFilter === 'sea') return order.shippingMode === 'sea';
                    if (deliveredFilter === 'shein') return order.platform.toLowerCase() === 'shein';
                    if (deliveredFilter === 'temu') return order.platform.toLowerCase() === 'temu';
                    if (deliveredFilter === 'alibaba') return order.platform.toLowerCase() === 'alibaba';
                    return true;
                  })
                  .map((order) => {
                    const platformStyles: Record<string, string> = {
                      Shein: 'bg-stone-900 text-white',
                      Temu: 'bg-amber-500 text-white',
                      Alibaba: 'bg-orange-600 text-white',
                      Autre: 'bg-purple-600 text-white'
                    };

                    return (
                      <div
                        key={order.id}
                        className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                      >
                        <div>
                          {/* Image du Colis avec badges */}
                          <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-stone-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={order.imageUrl}
                              alt={order.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => {
                                (e.target as any).src = 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop&q=80';
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

                            {/* Badge Plateforme */}
                            <div className="absolute top-3 left-3">
                              <span
                                className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-xs ${
                                  platformStyles[order.platform] || 'bg-stone-900 text-white'
                                }`}
                              >
                                {order.platform}
                              </span>
                            </div>

                            {/* Badge Mode de transport */}
                            <div className="absolute top-3 right-3 flex items-center gap-1.5">
                              <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-xs text-stone-800 shadow-xs flex items-center gap-1">
                                {order.shippingMode === 'sea' ? (
                                  <>
                                    <Ship className="w-3 h-3 text-indigo-600" />
                                    <span>Mer • {order.transitDays}j</span>
                                  </>
                                ) : (
                                  <>
                                    <Plane className="w-3 h-3 text-sky-600" />
                                    <span>Air • {order.transitDays}j</span>
                                  </>
                                )}
                              </span>
                            </div>

                            {/* Date et ticket en bas de l'image */}
                            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-white/90 font-medium">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-rose-300" />
                                <span>{order.deliveryDate}</span>
                              </div>
                              {order.ticketId && (
                                <span className="font-mono bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] text-rose-300 font-bold">
                                  {order.ticketId}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Contenu de la carte */}
                          <div className="p-4 sm:p-5 space-y-3">
                            {/* Nom Client & Ville */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-stone-900 text-sm">
                                  {order.clientName}
                                </span>
                                {order.verified && (
                                  <span title="Client Vérifié" className="inline-flex items-center">
                                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-[11px] text-stone-500">
                                <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                                <span className="truncate max-w-[120px]">{order.location}</span>
                              </div>
                            </div>

                            {/* Titre & Articles */}
                            <div>
                              <h4 className="font-serif font-black text-stone-900 text-sm leading-snug line-clamp-1">
                                {order.title}
                              </h4>
                              {order.itemsSummary && (
                                <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">
                                  {order.itemsSummary}
                                </p>
                              )}
                            </div>

                            {/* Étoiles de note */}
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3.5 h-3.5 ${
                                    s <= (order.rating || 5)
                                      ? 'text-amber-400 fill-amber-400'
                                      : 'text-stone-300'
                                  }`}
                                />
                              ))}
                              <span className="text-[10px] text-stone-400 font-bold ml-1">
                                {order.rating || 5}/5
                              </span>
                            </div>

                            {/* Avis client */}
                            {order.review && (
                              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100 text-xs italic text-stone-600 leading-relaxed line-clamp-3">
                                &ldquo;{order.review}&rdquo;
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions de la carte */}
                        <div className="p-4 pt-0 border-t border-stone-100 flex items-center justify-between mt-2">
                          <span className="text-[10px] font-bold text-stone-400 uppercase">
                            ID: {order.id}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditDelivered(order)}
                              className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                              title="Modifier"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Modifier</span>
                            </button>

                            <button
                              onClick={() => handleDeleteDeliveredOrder(order.id)}
                              className="p-1.5 rounded-xl bg-stone-100 hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                              title="Supprimer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
              </div>
            )}

          </div>
        )}

      </main>

      {/* ============================================================ */}
      {/* MODAL D'ÉDITION AVANCÉE D'UN TICKET */}
      {/* ============================================================ */}
      {isEditing && selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200 p-6 sm:p-8 space-y-8 my-auto animate-fade-in">
            
            {/* Titre Modal */}
            <div className="flex items-start justify-between border-b border-stone-100 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xl sm:text-2xl font-black text-rose-700">
                    {selectedTicket.id}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${STATUS_MAP[editStatus]?.badgeClass}`}>
                    {STATUS_MAP[editStatus]?.label}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  Client : <strong>{selectedTicket.client.name}</strong> • Tél : {selectedTicket.client.phone} • Ville : {selectedTicket.client.city} (Bénin)
                </p>
              </div>

              <button
                onClick={() => setIsEditing(false)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {saveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Ticket et statut mis à jour !</span>
              </div>
            )}

            {saveError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>{saveError}</span>
              </div>
            )}

            {/* STATUT DU COLIS & CHOIX DU MODE D'EXPÉDITION */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Mettre à jour le Statut
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as QuoteStatus)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm font-bold text-stone-800 outline-hidden"
                >
                  <option value="pending">⏳ En attente de devis (Calcul par Christaline)</option>
                  <option value="ready">📋 Devis prêt (Transmis au client avec montant total)</option>
                  <option value="accepted">✅ Devis validé par le client</option>
                  <option value="paid_deposit">💳 Acompte reçu (Prêt pour achat fournisseur)</option>
                  <option value="ordered">🛍️ Commande effectuée chez le fournisseur</option>
                  <option value="in_transit">✈️ En transit international vers le Bénin</option>
                  <option value="customs">🏛️ Arrivé au Bénin / Dédouanement (Cotonou)</option>
                  <option value="ready_for_pickup">🚚 Prêt pour livraison client / retrait agence</option>
                  <option value="delivered">📦 Colis livré avec succès</option>
                  <option value="cancelled">❌ Commande annulée</option>
                </select>
              </div>

              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Mode de Livraison / Délais
                </label>
                <select
                  value={editShippingMode}
                  onChange={(e) => setEditShippingMode(e.target.value as ShippingModeType)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm font-bold text-stone-800 outline-hidden"
                >
                  <option value="air">✈️ Voie Aérienne (Délai : Au plus 1 mois)</option>
                  <option value="sea">🚢 Voie Maritime (Délai : 2 à 3 mois)</option>
                </select>
              </div>
            </div>

            {/* ARTICLES & PRIX TOTAL DE CHAQUE ARTICLE */}
            <div className="space-y-4">
              <div className="border-l-4 border-rose-500 pl-3">
                <h3 className="font-bold text-stone-900 text-base">
                  1. Prix Total par article en FCFA (affiché au client)
                </h3>
                <p className="text-xs text-stone-500">
                  Le client verra simplement ce prix total par article, sans aucun détail technique interne.
                </p>
              </div>

              <div className="space-y-4">
                {editItems.map((item, idx) => (
                  <div key={item.id} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-stone-800 text-white">
                          {item.platform}
                        </span>
                        <span className="font-bold text-stone-900 text-sm">
                          {item.name} (Qté : {item.quantity})
                        </span>
                        {item.variant && (
                          <span className="text-xs text-stone-500">[{item.variant}]</span>
                        )}
                      </div>

                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 bg-white px-2.5 py-1 rounded-lg border border-rose-200"
                      >
                        <span>Voir l'article</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          Prix Total de cet article pour le client (FCFA)
                        </label>
                        <input
                          type="number"
                          value={item.totalItemCFA || ''}
                          onChange={(e) => updateItemTotalPrice(idx, parseFloat(e.target.value) || 0)}
                          placeholder="Ex: 31000"
                          className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white font-black text-rose-700 text-base"
                        />
                      </div>

                      <div className="text-xs text-stone-500">
                        {item.originalPrice ? (
                          <span>Prix sur la plateforme : <strong>{item.originalPrice} {item.originalCurrency || 'EUR'}</strong></span>
                        ) : (
                          <span>Renseignez le montant net en FCFA qui sera facturé au client.</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SYNTHÈSE GLOBALE & ACOMPTES */}
            <div className="bg-rose-50/50 p-5 rounded-2xl border border-rose-200 space-y-4">
              <h3 className="font-bold text-stone-900 text-base">
                2. Total Commande & Acompte Demandé
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Remise éventuelle (FCFA)</label>
                  <input
                    type="number"
                    value={editDiscount || ''}
                    onChange={(e) => setEditDiscount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Acompte à payer (FCFA)</label>
                  <input
                    type="number"
                    value={editDepositRequired || ''}
                    onChange={(e) => setEditDepositRequired(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-bold text-sm text-amber-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Acompte déjà reçu (FCFA)</label>
                  <input
                    type="number"
                    value={editDepositPaid || ''}
                    onChange={(e) => setEditDepositPaid(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-bold text-sm text-emerald-700"
                  />
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-rose-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm font-bold">
                <div>
                  <span className="text-stone-500 text-xs block">PRIX TOTAL DE LA COMMANDE :</span>
                  <span className="text-xl font-black text-rose-700">
                    {new Intl.NumberFormat('fr-FR').format(computedGrandTotal)} FCFA
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 text-xs block">SOLDE RESTANT À LA LIVRAISON :</span>
                  <span className="text-lg font-black text-stone-900">
                    {new Intl.NumberFormat('fr-FR').format(computedBalanceRemaining)} FCFA
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Message pour le client (Optionnel)</label>
                <textarea
                  rows={2}
                  value={editAdminNote}
                  onChange={(e) => setEditAdminNote(e.target.value)}
                  placeholder="Ex: Devis validé ! Merci de régler l'acompte par MoMo ou Moov pour validation..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs outline-hidden"
                />
              </div>
            </div>

            {/* EXPÉDITION & SUIVI TRANSPORTEUR */}
            <div className="space-y-4">
              <h3 className="font-bold text-stone-900 text-base border-l-4 border-amber-500 pl-3">
                3. Suivi Fournisseur & Colis
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">N° Commande Fournisseur</label>
                  <input
                    type="text"
                    value={editSupplierOrderNumber}
                    onChange={(e) => setEditSupplierOrderNumber(e.target.value)}
                    placeholder="Ex: SHEIN-291820"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Transporteur / Hub</label>
                  <input
                    type="text"
                    value={editCarrierName}
                    onChange={(e) => setEditCarrierName(e.target.value)}
                    placeholder={editShippingMode === 'sea' ? 'Cargo Maritime Cotonou' : 'Cargo Aérien Cotonou'}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">N° de Suivi Colis</label>
                  <input
                    type="text"
                    value={editCarrierTrackingNumber}
                    onChange={(e) => setEditCarrierTrackingNumber(e.target.value)}
                    placeholder="Ex: CST-BEN-99214"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                <span className="text-xs font-bold text-stone-700 block">
                  + Ajouter un événement spécial à la Timeline du client
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Titre (ex: Conteneur déchargé au Port de Cotonou)"
                    value={newTimelineStepTitle}
                    onChange={(e) => setNewTimelineStepTitle(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-stone-300 text-xs bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Détails (ex: Inspection douanière en cours)"
                    value={newTimelineStepDesc}
                    onChange={(e) => setNewTimelineStepDesc(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-stone-300 text-xs bg-white"
                  />
                </div>
              </div>
            </div>

            {/* BOUTONS ACTIONS MODAL */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-stone-200">
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={generateClientWhatsAppMessage(selectedTicket)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Notifier le client sur WhatsApp (Bénin)</span>
                </a>

                {(editStatus === 'delivered' || selectedTicket.quote?.status === 'delivered' || selectedTicket.tracking?.currentStatus === 'delivered') && (
                  <button
                    type="button"
                    onClick={() => handlePromoteTicketToDeliveredProof(selectedTicket)}
                    className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    title="Publier ce colis dans la galerie publique de suivi"
                  >
                    <Camera className="w-4 h-4 text-rose-600" />
                    <span>📸 Publier en Colis Reçu</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  Fermer
                </button>

                <button
                  type="button"
                  onClick={handleSaveTicket}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white px-6 py-2.5 rounded-xl text-xs font-black shadow-md shadow-rose-200 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Enregistrer les modifications</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL CRÉATION / ÉDITION D'UNE VENTE EN GROUPE */}
      {/* ============================================================ */}
      {showGbModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200 p-6 sm:p-8 space-y-6 my-auto">
            
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-stone-900 font-serif">
                    {editingGb ? 'Modifier la Vente en Groupe' : 'Nouvelle Vente en Groupe'}
                  </h2>
                  <p className="text-xs text-stone-500">
                    Définissez l'article, la date de commande, la quantité minimum et le prix
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowGbModal(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {gbError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{gbError}</span>
              </div>
            )}

            <form onSubmit={handleSaveGroupBuy} className="space-y-4">
              
              {/* Titre */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Titre de l'article *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Escarpins Luxe Strass & Finition Soie"
                  value={gbTitle}
                  onChange={(e) => setGbTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Description détaillée
                </label>
                <textarea
                  rows={2}
                  placeholder="Détails du produit, qualité, occasions idéales..."
                  value={gbDescription}
                  onChange={(e) => setGbDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              {/* Image URL & Suggestions rapides */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Photo / Image du produit (URL) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://..."
                  value={gbImageUrl}
                  onChange={(e) => setGbImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-mono"
                />

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-stone-400 font-medium">Exemples rapides :</span>
                  <button
                    type="button"
                    onClick={() => setGbImageUrl('https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop&q=80')}
                    className="text-[10px] bg-stone-100 hover:bg-rose-50 hover:text-rose-700 px-2 py-0.5 rounded-md font-bold cursor-pointer"
                  >
                    👠 Escarpins
                  </button>
                  <button
                    type="button"
                    onClick={() => setGbImageUrl('https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80')}
                    className="text-[10px] bg-stone-100 hover:bg-rose-50 hover:text-rose-700 px-2 py-0.5 rounded-md font-bold cursor-pointer"
                  >
                    💄 Pinceaux
                  </button>
                  <button
                    type="button"
                    onClick={() => setGbImageUrl('https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&auto=format&fit=crop&q=80')}
                    className="text-[10px] bg-stone-100 hover:bg-rose-50 hover:text-rose-700 px-2 py-0.5 rounded-md font-bold cursor-pointer"
                  >
                    👗 Robe
                  </button>
                  <button
                    type="button"
                    onClick={() => setGbImageUrl('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80')}
                    className="text-[10px] bg-stone-100 hover:bg-rose-50 hover:text-rose-700 px-2 py-0.5 rounded-md font-bold cursor-pointer"
                  >
                    👖 Jogging
                  </button>
                  <button
                    type="button"
                    onClick={() => setGbImageUrl('https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80')}
                    className="text-[10px] bg-stone-100 hover:bg-rose-50 hover:text-rose-700 px-2 py-0.5 rounded-md font-bold cursor-pointer"
                  >
                    👜 Sac Chic
                  </button>
                  <button
                    type="button"
                    onClick={() => setGbImageUrl('https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80')}
                    className="text-[10px] bg-stone-100 hover:bg-rose-50 hover:text-rose-700 px-2 py-0.5 rounded-md font-bold cursor-pointer"
                  >
                    💍 Bijoux
                  </button>
                </div>
              </div>

              {/* PRIX FCFA & PRIX BARRÉ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Prix Vente Groupée (FCFA) *
                  </label>
                  <input
                    type="number"
                    required
                    min={100}
                    placeholder="Ex: 18500"
                    value={gbPriceCFA}
                    onChange={(e) => setGbPriceCFA(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono font-bold text-sm text-rose-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Prix Public indicatif (FCFA, optionnel)
                  </label>
                  <input
                    type="number"
                    min={100}
                    placeholder="Ex: 28000 (affiché barré)"
                    value={gbOriginalPriceCFA}
                    onChange={(e) => setGbOriginalPriceCFA(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono text-sm text-stone-600"
                  />
                </div>
              </div>

              {/* QUANTITÉ MINIMUM & DATE DE PASSAGE COMMANDE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-amber-50/70 p-4 rounded-2xl border border-amber-200">
                <div>
                  <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider mb-1">
                    Quantité minimum requise *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="Ex: 10"
                    value={gbMinQty}
                    onChange={(e) => setGbMinQty(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-amber-300 bg-white font-mono font-bold text-sm text-amber-950"
                  />
                  <p className="text-[10px] text-amber-700 mt-1">
                    Objectif à atteindre pour valider l'achat groupé
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider mb-1">
                    Date où la commande sera passée *
                  </label>
                  <input
                    type="date"
                    required
                    value={gbOrderDate}
                    onChange={(e) => setGbOrderDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-amber-300 bg-white font-mono font-bold text-sm text-amber-950"
                  />
                  <p className="text-[10px] text-amber-700 mt-1">
                    Date limite à laquelle l'admin commande chez le fournisseur
                  </p>
                </div>
              </div>

              {/* Mode de transport & Plateforme */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Mode d'expédition Bénin *
                  </label>
                  <select
                    value={gbShippingMode}
                    onChange={(e) => setGbShippingMode(e.target.value as ShippingModeType)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-bold"
                  >
                    <option value="air">✈️ Voie Aérienne (au plus 1 mois)</option>
                    <option value="sea">🚢 Voie Maritime (2 à 3 mois)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Plateforme Fournisseur *
                  </label>
                  <select
                    value={gbPlatform}
                    onChange={(e) => setGbPlatform(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-bold"
                  >
                    <option value="shein">SHEIN</option>
                    <option value="temu">TEMU</option>
                    <option value="autre">Autre Fournisseur</option>
                  </select>
                </div>
              </div>

              {/* Tailles / Variantes */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Options & Tailles (séparées par des virgules)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Taille 38 Noir, Taille 39 Doré, Taille 40 Champagne"
                  value={gbVariants}
                  onChange={(e) => setGbVariants(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              {/* Statut */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Statut de la vente
                </label>
                <select
                  value={gbStatus}
                  onChange={(e) => setGbStatus(e.target.value as GroupBuyStatus)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-bold"
                >
                  <option value="open">En cours (Réservations ouvertes)</option>
                  <option value="goal_reached">Objectif Atteint (Confirmée)</option>
                  <option value="ordered">Commande Passée chez le fournisseur</option>
                  <option value="closed">Clôturée</option>
                </select>
              </div>

              {/* Boutons formulaire */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowGbModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-600 font-bold text-xs hover:bg-stone-100 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-black text-xs shadow-md shadow-rose-200 cursor-pointer"
                >
                  {editingGb ? 'Enregistrer les modifications' : 'Créer la Vente en Groupe'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL LISTE DES PARTICIPANTS D'UNE VENTE EN GROUPE */}
      {/* ============================================================ */}
      {viewingParticipantsGb && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200 p-6 sm:p-8 space-y-6 my-auto">
            
            <div className="flex items-start justify-between border-b border-stone-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                  {viewingParticipantsGb.platform?.toUpperCase() || 'SHEIN'} • Achat Groupé
                </span>
                <h2 className="text-xl font-black text-stone-900 font-serif mt-1">
                  Réservations Clients : {viewingParticipantsGb.title}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 mt-1">
                  <span>Prix : <strong>{viewingParticipantsGb.priceCFA.toLocaleString('fr-FR')} FCFA</strong></span>
                  <span>•</span>
                  <span>Commande passée le : <strong>{viewingParticipantsGb.orderDate}</strong></span>
                  <span>•</span>
                  <span className="text-rose-600 font-bold">
                    {viewingParticipantsGb.currentQuantity} / {viewingParticipantsGb.minQuantity} pièces
                  </span>
                </div>
              </div>

              <button
                onClick={() => setViewingParticipantsGb(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tableau des participants */}
            {(!viewingParticipantsGb.participants || viewingParticipantsGb.participants.length === 0) ? (
              <div className="p-8 text-center text-stone-400 text-xs">
                Aucune réservation enregistrée pour le moment pour cet article.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-stone-100 text-stone-700 uppercase text-[10px] tracking-wider font-bold">
                      <tr>
                        <th className="p-3 rounded-l-xl">Client</th>
                        <th className="p-3">WhatsApp / Ville</th>
                        <th className="p-3">Option</th>
                        <th className="p-3 text-center">Quantité</th>
                        <th className="p-3 text-right">Total FCFA</th>
                        <th className="p-3 text-center">Ticket Lié</th>
                        <th className="p-3 rounded-r-xl text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                      {viewingParticipantsGb.participants.map((p) => {
                        const total = p.quantity * viewingParticipantsGb.priceCFA;
                        const cleanPhone = p.whatsapp.replace(/\D/g, '');
                        const waNumber = cleanPhone.startsWith('229') ? cleanPhone : `229${cleanPhone}`;

                        return (
                          <tr key={p.id} className="hover:bg-stone-50/80">
                            <td className="p-3 font-bold text-stone-900">
                              {p.clientName}
                            </td>
                            <td className="p-3">
                              <div>{p.whatsapp}</div>
                              <div className="text-[10px] text-stone-400">{p.city}</div>
                            </td>
                            <td className="p-3 text-[11px] text-stone-600">
                              {p.variant || 'Standard'}
                            </td>
                            <td className="p-3 text-center font-mono font-bold text-stone-900">
                              {p.quantity} pcs
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-rose-700">
                              {total.toLocaleString('fr-FR')} FCFA
                            </td>
                            <td className="p-3 text-center">
                              {p.ticketId ? (
                                <Link
                                  href={`/ticket/${p.ticketId}`}
                                  target="_blank"
                                  className="font-mono font-bold text-rose-600 hover:underline flex items-center justify-center gap-1"
                                >
                                  <span>{p.ticketId}</span>
                                  <ExternalLink className="w-3 h-3" />
                                </Link>
                              ) : (
                                <span className="text-stone-400">-</span>
                              )}
                            </td>
                            <td className="p-3 text-center">
                              <a
                                href={`https://wa.me/${waNumber}?text=Bonjour%20${encodeURIComponent(p.clientName)}%2C%20Christaline%20Shop%20au%20sujet%20de%20votre%20r%C3%A9servation%20group%C3%A9e%20${p.ticketId || ''}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors"
                              >
                                <MessageCircle className="w-3 h-3 fill-white" />
                                <span>WhatsApp</span>
                              </a>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => setViewingParticipantsGb(null)}
                className="px-5 py-2.5 rounded-xl bg-stone-900 text-white font-bold text-xs hover:bg-stone-800 cursor-pointer"
              >
                Fermer
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL CRÉATION / ÉDITION D'UNE PREUVE DE COLIS REÇU */}
      {/* ============================================================ */}
      {showDeliveredModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200 p-6 sm:p-8 space-y-6 my-auto">
            
            {/* Titre Modal */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-xs">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-stone-900 font-serif">
                    {editingDeliveredOrder ? 'Modifier la Preuve de Réception' : 'Nouvelle Preuve de Colis Reçu'}
                  </h2>
                  <p className="text-xs text-stone-500">
                    Ces détails seront affichés dans le carrousel animé de la page de suivi (/suivi)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowDeliveredModal(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {delError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{delError}</span>
              </div>
            )}

            <form onSubmit={handleSaveDeliveredOrder} className="space-y-4">
              
              {/* PHOTO DU COLIS (URL, UPLOAD OU EXEMPLES) */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Photo du Colis / Déballage *
                </label>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Prévisualisation */}
                  <div className="w-28 h-28 rounded-2xl bg-stone-200 border-2 border-dashed border-stone-300 overflow-hidden shrink-0 flex items-center justify-center relative">
                    {delImageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={delImageUrl}
                        alt="Prévisualisation colis"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as any).src = 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop&q=80';
                        }}
                      />
                    ) : (
                      <Camera className="w-8 h-8 text-stone-400" />
                    )}
                  </div>

                  <div className="flex-1 space-y-2 w-full">
                    {/* Upload direct */}
                    <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-800 font-bold text-xs cursor-pointer border border-stone-300 shadow-2xs">
                      <Upload className="w-3.5 h-3.5 text-rose-600" />
                      <span>Sélectionner une photo depuis l'appareil</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageFileUpload}
                      />
                    </label>

                    {/* Champ URL direct */}
                    <div>
                      <input
                        type="url"
                        placeholder="Ou collez l'URL d'une image (https://...)"
                        value={delImageUrl}
                        onChange={(e) => setDelImageUrl(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Exemples rapides */}
                <div>
                  <span className="text-[11px] font-bold text-stone-500 block mb-1.5">
                    Ou choisir un visuel haute définition en 1 clic :
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setDelImageUrl('https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&auto=format&fit=crop&q=80')}
                      className="text-[10px] bg-white hover:bg-rose-50 hover:text-rose-700 px-2.5 py-1 rounded-lg border border-stone-200 font-bold cursor-pointer"
                    >
                      👗 Robe de Soirée
                    </button>
                    <button
                      type="button"
                      onClick={() => setDelImageUrl('https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80')}
                      className="text-[10px] bg-white hover:bg-rose-50 hover:text-rose-700 px-2.5 py-1 rounded-lg border border-stone-200 font-bold cursor-pointer"
                    >
                      👟 Sneakers / Sport
                    </button>
                    <button
                      type="button"
                      onClick={() => setDelImageUrl('https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=800&auto=format&fit=crop&q=80')}
                      className="text-[10px] bg-white hover:bg-rose-50 hover:text-rose-700 px-2.5 py-1 rounded-lg border border-stone-200 font-bold cursor-pointer"
                    >
                      🧳 Valises Voyage
                    </button>
                    <button
                      type="button"
                      onClick={() => setDelImageUrl('https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80')}
                      className="text-[10px] bg-white hover:bg-rose-50 hover:text-rose-700 px-2.5 py-1 rounded-lg border border-stone-200 font-bold cursor-pointer"
                    >
                      👜 Sac à Main
                    </button>
                    <button
                      type="button"
                      onClick={() => setDelImageUrl('https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&auto=format&fit=crop&q=80')}
                      className="text-[10px] bg-white hover:bg-rose-50 hover:text-rose-700 px-2.5 py-1 rounded-lg border border-stone-200 font-bold cursor-pointer"
                    >
                      💄 Cosmétiques
                    </button>
                    <button
                      type="button"
                      onClick={() => setDelImageUrl('https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&auto=format&fit=crop&q=80')}
                      className="text-[10px] bg-white hover:bg-rose-50 hover:text-rose-700 px-2.5 py-1 rounded-lg border border-stone-200 font-bold cursor-pointer"
                    >
                      👔 Blazer & Chic
                    </button>
                    <button
                      type="button"
                      onClick={() => setDelImageUrl('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80')}
                      className="text-[10px] bg-white hover:bg-rose-50 hover:text-rose-700 px-2.5 py-1 rounded-lg border border-stone-200 font-bold cursor-pointer"
                    >
                      ⌚ High-Tech / Montre
                    </button>
                    <button
                      type="button"
                      onClick={() => setDelImageUrl('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80')}
                      className="text-[10px] bg-white hover:bg-rose-50 hover:text-rose-700 px-2.5 py-1 rounded-lg border border-stone-200 font-bold cursor-pointer"
                    >
                      📦 Colis Ouvert
                    </button>
                  </div>
                </div>
              </div>

              {/* CLIENT & LOCALISATION AU BÉNIN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Nom ou Prénom du Client *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Nadège G."
                    value={delClientName}
                    onChange={(e) => setDelClientName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Ville ou Quartier (Bénin) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Cotonou (Akpakpa) ou Calavi"
                    value={delLocation}
                    onChange={(e) => setDelLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold"
                  />
                </div>
              </div>

              {/* TITRE & N° TICKET */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Titre du Colis / Produits reçus *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Robes de Soirée & Escarpins Strass"
                    value={delTitle}
                    onChange={(e) => setDelTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    N° Ticket associé (Optionnel)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: CS-784210"
                    value={delTicketId}
                    onChange={(e) => setDelTicketId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono text-sm uppercase text-rose-700"
                  />
                </div>
              </div>

              {/* ARTICLES SOMMAIRE */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Résumé des articles dans le colis
                </label>
                <input
                  type="text"
                  placeholder="Ex: 2 Robes gala satin + 1 Paire d’escarpins dorés"
                  value={delItemsSummary}
                  onChange={(e) => setDelItemsSummary(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              {/* PLATEFORME & MODE D'EXPÉDITION */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Plateforme d'achat *
                  </label>
                  <select
                    value={delPlatform}
                    onChange={(e) => setDelPlatform(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-bold"
                  >
                    <option value="Shein">SHEIN</option>
                    <option value="Temu">TEMU</option>
                    <option value="Alibaba">ALIBABA</option>
                    <option value="Autre">AUTRE FOURNISSEUR</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Mode d'expédition Bénin *
                  </label>
                  <select
                    value={delShippingMode}
                    onChange={(e) => setDelShippingMode(e.target.value as 'air' | 'sea')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-bold"
                  >
                    <option value="air">✈️ Voie Aérienne (au plus 1 mois)</option>
                    <option value="sea">🚢 Voie Maritime (2 à 3 mois)</option>
                  </select>
                </div>
              </div>

              {/* TRANSIT & DATE D'AFFICHAGE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Délai de transit réel (jours)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={150}
                    value={delTransitDays}
                    onChange={(e) => setDelTransitDays(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-bold"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">Ex: 18 pour aérien, 70 pour maritime</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Mention de réception affichée
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Reçu il y a 3 jours, Livré hier..."
                    value={delDeliveryDate}
                    onChange={(e) => setDelDeliveryDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs"
                  />
                </div>
              </div>

              {/* NOTE EN ÉTOILES */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Note du Client (1 à 5 Étoiles)
                </label>
                <div className="flex items-center gap-1.5 p-2 bg-stone-50 rounded-xl border border-stone-200">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setDelRating(star)}
                      className="p-1 rounded hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= delRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-stone-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-3 text-xs font-bold text-stone-700">
                    {delRating} sur 5 étoiles
                  </span>
                </div>
              </div>

              {/* AVIS CLIENT */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Témoignage / Retour du Client *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ex: Articles magnifiques et emballage soigné. Reçu pile avant mon événement familial, je recommande vivement Christaline Shop !"
                  value={delReview}
                  onChange={(e) => setDelReview(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs leading-relaxed"
                />
              </div>

              {/* BADGE VÉRIFIÉ */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="delVerifiedCheck"
                  checked={delVerified}
                  onChange={(e) => setDelVerified(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                />
                <label htmlFor="delVerifiedCheck" className="text-xs font-bold text-stone-700 cursor-pointer flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Afficher le badge vert &laquo; Client Vérifié &raquo;</span>
                </label>
              </div>

              {/* BOUTONS ACTIONS */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowDeliveredModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-600 font-bold text-xs hover:bg-stone-100 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={delSaving}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-black text-xs shadow-md shadow-rose-200 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {delSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Enregistrement...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{editingDeliveredOrder ? 'Mettre à jour' : 'Enregistrer la Preuve'}</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Modal de renouvellement FeexPay (dans le Dashboard) */}
      <FeexPayRenewalModal
        isOpen={showRenewalModal}
        onClose={() => {
          setShowRenewalModal(false);
          setWaitingForMobilePin(false);
        }}
        monthlyFeeCFA={subscriptionInfo?.monthlyFeeCFA || 15000}
        subscriptionDurationDays={subscriptionInfo?.subscriptionDurationDays || 30}
        renewalPhone={renewalPhone}
        setRenewalPhone={setRenewalPhone}
        renewalOperator={renewalOperator}
        setRenewalOperator={setRenewalOperator}
        processingPayment={processingPayment}
        onSubmitRenewal={handleFeexPayRenewal}
        paymentSuccessData={paymentSuccessData}
        paymentError={paymentError}
        waitingForMobilePin={waitingForMobilePin}
        onManualCheckStatus={handleManualCheckPendingStatus}
        feexpayMode={(subscriptionInfo as any)?.feexpayMode || 'SANDBOX'}
        paymentUrl={paymentUrl}
        onSuccessProceed={() => {
          setShowRenewalModal(false);
          setWaitingForMobilePin(false);
        }}
      />

      {/* Barre de navigation basse pour l'application mobile Android */}
      {isMobileMode && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-stone-200 py-2 px-2 z-40 flex items-center justify-around shadow-2xl">
          <button
            type="button"
            onClick={() => { setActiveAdminTab('tickets'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${
              activeAdminTab === 'tickets' ? 'text-rose-600 bg-rose-50' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span>Commandes</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveAdminTab('delivered_orders'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${
              activeAdminTab === 'delivered_orders' ? 'text-rose-600 bg-rose-50' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Colis reçus</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveAdminTab('group_buys'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${
              activeAdminTab === 'group_buys' ? 'text-rose-600 bg-rose-50' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Groupés</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveAdminTab('marketing'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${
              activeAdminTab === 'marketing' ? 'text-rose-600 bg-rose-50' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span>Stats</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveAdminTab('settings'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${
              activeAdminTab === 'settings' ? 'text-rose-600 bg-rose-50' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>Paramètres</span>
          </button>
        </nav>
      )}

    </div>
  );
}
