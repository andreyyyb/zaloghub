import type { PointerEvent } from 'react'
import checkIcon from '../../../assets/check.svg'
import checkDarkIcon from '../../../assets/check-dark.svg'
import pencilIcon from '../../../assets/pencil.svg'
import pencilDarkIcon from '../../../assets/pencil-dark.svg'

type TitleEditButtonProps = {
  showCheck: boolean
  formId: string
  editLabel: string
  saveLabel: string
  className?: string
  onPointerDown: (event: PointerEvent<HTMLButtonElement>) => void
  onClick: () => void
}

function TitleEditButton({
  showCheck,
  formId,
  editLabel,
  saveLabel,
  className,
  onPointerDown,
  onClick,
}: TitleEditButtonProps) {
  const buttonClassName = ['icon-button', className, showCheck ? 'is-editing' : '']
    .filter((part) => part !== undefined && part.length > 0)
    .join(' ')

  return (
    <button
      type={showCheck ? 'submit' : 'button'}
      form={showCheck ? formId : undefined}
      className={buttonClassName}
      data-save-title={showCheck ? 'true' : undefined}
      aria-label={showCheck ? saveLabel : editLabel}
      onPointerDown={onPointerDown}
      onClick={onClick}
    >
      <span className="edit-icon">
        <img className="icon-light icon-pencil" src={pencilIcon} alt="" width={24} height={24} />
        <img className="icon-dark icon-pencil" src={pencilDarkIcon} alt="" width={24} height={24} />
        <img className="icon-light icon-save" src={checkIcon} alt="" width={24} height={24} />
        <img className="icon-dark icon-save" src={checkDarkIcon} alt="" width={24} height={24} />
      </span>
    </button>
  )
}

export default TitleEditButton
