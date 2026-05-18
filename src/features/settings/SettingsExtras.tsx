type Props = {
  showAsFaces: boolean;
  onShowAsFacesChange: (next: boolean) => void;
};

export function SettingsExtras({ showAsFaces, onShowAsFacesChange }: Props) {
  return (
    <label className="settings-check">
      <input
        type="checkbox"
        checked={showAsFaces}
        onChange={(e) => onShowAsFacesChange(e.target.checked)}
      />
      <span>Show distribution as faces (😟😐🙂😊🤩)</span>
    </label>
  );
}
