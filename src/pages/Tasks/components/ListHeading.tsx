import { useId, useRef } from 'react'
import useTitleEditor from '../utils/useTitleEditor'
import TitleEditButton from './TitleEditButton'

type ListHeadingProps = {
  title: string
  onRename: (title: string) => void
}

function ListHeading({ title, onRename }: ListHeadingProps) {
  const editFormId = useId()
  const titleInputId = useId()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const editor = useTitleEditor(title, onRename, inputRef)

  return (
    <div className="page-heading">
      {editor.isEditing ? (
        <form id={editFormId} className="heading-edit" onSubmit={editor.handleEditSubmit}>
          <span className="heading-sizer" aria-hidden="true">
            {editor.draftTitle.length > 0 ? editor.draftTitle : ' '}
          </span>
          <label className="visually-hidden" htmlFor={titleInputId}>
            Название списка
          </label>
          <input
            ref={inputRef}
            id={titleInputId}
            name="draft-title"
            type="text"
            value={editor.draftTitle}
            autoFocus
            enterKeyHint="done"
            autoComplete="off"
            onChange={(event) => {
              editor.setDraftTitle(event.target.value)
            }}
            onBlur={editor.handleDraftBlur}
            onKeyDown={editor.handleEditKeyDown}
          />
        </form>
      ) : (
        <h1>{title}</h1>
      )}
      <TitleEditButton
        showCheck={editor.showCheck}
        formId={editFormId}
        className="heading-edit-button"
        editLabel="Изменить название списка"
        saveLabel="Сохранить название списка"
        onPointerDown={editor.handleSavePointerDown}
        onClick={editor.handleEditClick}
      />
    </div>
  )
}

export default ListHeading
