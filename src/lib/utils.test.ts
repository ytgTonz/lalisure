import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      expect(cn('foo', 'bar')).toBe('foo bar')
    })

    it('should handle conditional classes', () => {
      expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
      expect(cn('foo', true && 'bar', 'baz')).toBe('foo bar baz')
    })

    it('should handle tailwind class conflicts', () => {
      expect(cn('px-2', 'px-4')).toBe('px-4')
      expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500')
    })

    it('should handle undefined and null values', () => {
      expect(cn('foo', undefined, null, 'bar')).toBe('foo bar')
    })

    it('should handle empty string', () => {
      expect(cn('')).toBe('')
      expect(cn('foo', '', 'bar')).toBe('foo bar')
    })
  })
})