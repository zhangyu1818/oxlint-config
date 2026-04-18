const NO_MANUAL_MEMOIZATION_MESSAGE =
  'React Compiler automatically optimizes components and values, so manual memoization is not needed.'

const NO_FORWARD_REF_MESSAGE =
  'Starting in React 19, ref is a prop, so forwardRef is no longer needed.'

const EFFECT_EMPTY_DEPS_ONLY_MESSAGE =
  'Effects here must use an empty dependency array. Use them only for mount and unmount logic. For event-driven logic, use useEffectEvent inside the effect. Do not use effects as a watch mechanism.'

const manualMemoizationNames = new Set(['memo', 'useMemo', 'useCallback'])
const effectNames = new Set(['useEffect', 'useLayoutEffect'])
const forwardRefNames = new Set(['forwardRef'])

interface IdentifierNode {
  name: string
  type: 'Identifier'
}

interface MemberExpressionNode {
  computed: boolean
  object: unknown
  property: unknown
  type: 'MemberExpression'
}

interface ArrayExpressionNode {
  elements: unknown[]
  type: 'ArrayExpression'
}

interface CallExpressionNode {
  arguments: unknown[]
  callee: unknown
  type: 'CallExpression'
}

interface RuleContext {
  report(descriptor: {
    message: string
    node: unknown
  }): void
}

function isRecord(node: unknown): node is Record<string, unknown> {
  return typeof node === 'object' && node !== null
}

function isIdentifier(node: unknown, name: string): node is IdentifierNode {
  return (
    isRecord(node)
    && node.type === 'Identifier'
    && node.name === name
  )
}

function isNamedIdentifier(
  node: unknown,
  names: Set<string>,
): node is IdentifierNode {
  return (
    isRecord(node)
    && node.type === 'Identifier'
    && typeof node.name === 'string'
    && names.has(node.name)
  )
}

function isMemberExpression(node: unknown): node is MemberExpressionNode {
  return (
    isRecord(node)
    && node.type === 'MemberExpression'
    && typeof node.computed === 'boolean'
    && 'object' in node
    && 'property' in node
  )
}

function isReactMember(node: unknown, names: Set<string>) {
  return (
    isMemberExpression(node)
    && !node.computed
    && isIdentifier(node.object, 'React')
    && isNamedIdentifier(node.property, names)
  )
}

function isEmptyDependencyArray(node: unknown): node is ArrayExpressionNode {
  return (
    isRecord(node)
    && node.type === 'ArrayExpression'
    && Array.isArray(node.elements)
    && node.elements.length === 0
  )
}

const noManualMemoizationRule = {
  meta: {
    schema: [],
  },
  create(context: RuleContext) {
    return {
      CallExpression(node: CallExpressionNode) {
        if (
          isNamedIdentifier(node.callee, manualMemoizationNames)
          || isReactMember(node.callee, manualMemoizationNames)
        ) {
          context.report({
            message: NO_MANUAL_MEMOIZATION_MESSAGE,
            node,
          })
        }
      },
    }
  },
}

const noForwardRefRule = {
  meta: {
    schema: [],
  },
  create(context: RuleContext) {
    return {
      CallExpression(node: CallExpressionNode) {
        if (
          isNamedIdentifier(node.callee, forwardRefNames)
          || isReactMember(node.callee, forwardRefNames)
        ) {
          context.report({
            message: NO_FORWARD_REF_MESSAGE,
            node,
          })
        }
      },
    }
  },
}

const effectEmptyDepsOnlyRule = {
  meta: {
    schema: [],
  },
  create(context: RuleContext) {
    return {
      CallExpression(node: CallExpressionNode) {
        if (
          !isNamedIdentifier(node.callee, effectNames)
          && !isReactMember(node.callee, effectNames)
        ) {
          return
        }

        const dependencyArray = node.arguments[1]

        if (!isEmptyDependencyArray(dependencyArray)) {
          context.report({
            message: EFFECT_EMPTY_DEPS_ONLY_MESSAGE,
            node,
          })
        }
      },
    }
  },
}

const plugin = {
  meta: {
    name: 'react-agent-rules',
  },
  rules: {
    'effect-empty-deps-only': effectEmptyDepsOnlyRule,
    'no-forward-ref': noForwardRefRule,
    'no-manual-memoization': noManualMemoizationRule,
  },
}

export default plugin
