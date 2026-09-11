import { useState } from 'react';
import { ButtonNaked } from '@pagopa/mui-italia';
import DownloadIcon from '@mui/icons-material/Download';
import { getInitiativeConfig } from '../../config/initiativeResolver';

const DownloadCsvLink = () => {
  const config = getInitiativeConfig();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      const today = new Date();
      let dateStr = today.toISOString().split('T')[0];
      let url = `${import.meta.env.BASE_URL}data/export_daily_${
        config.initiativeId
      }_${dateStr}.csv`;

      let res = await fetch(url);

      if (!res.ok) {
        console.log(`File (${dateStr}) not found`);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        dateStr = yesterday.toISOString().split('T')[0];
        url = `${import.meta.env.BASE_URL}data/export_daily_${dateStr}.csv`;

        res = await fetch(url);

        if (!res.ok) {
          throw new Error(`CSV not found`);
        }
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `export_daily_${config.initiativeId}_${dateStr}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
    } catch (err) {
      console.error(err instanceof Error ? err.message : 'Download Error');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <ButtonNaked
      weight="default"
      startIcon={<DownloadIcon />}
      color="primary"
      size="medium"
      onClick={handleDownload}
      sx={{ color: '#0B3EE3', mb: 1 }}
    >
      {'Scarica la lista in formato csv'}
    </ButtonNaked>
  );
};

export default DownloadCsvLink;
