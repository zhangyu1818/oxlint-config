import type { FC } from 'react'

const List: FC = () => {
  return [1, 2].map((value) => <span>{value}</span>)
}

const UnsafeLink: FC = () => (
  <a href="https://example.com" target="_blank">
    Link
  </a>
)

const UnescapedEntity: FC = () => <div>Don't do this</div>

const UnnecessaryBraces: FC = () => <div className={'container'}>Content</div>
const NotSelfClosing: FC = () => <div></div>

export {
  List,
  NotSelfClosing,
  UnescapedEntity,
  UnnecessaryBraces,
  UnsafeLink,
}
