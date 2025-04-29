import { toast as toastSonner } from 'sonner';
export const toast = ({ title, description, variant }: any) => {
  switch (variant) {
    case 'destructive':
      toastSonner.error(title, {
        description,
        style: { maxWidth: '100%', color: 'red' },
      });
      break;
    case 'success':
      toastSonner.success(title, { description });
      break;
    default:
      toastSonner(title, { description });
      break;
  }
};

export const useToast = () => {
  return {
    toast,
  };
};
