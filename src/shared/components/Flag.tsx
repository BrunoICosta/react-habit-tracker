import { useId } from 'react'
import type { Language } from '../../i18n/resources'

interface FlagProps {
  language: Language
  width?: number
}

/** Decorative inline SVG flags (flag emoji do not render on Windows). 28x20 viewBox. */
export function Flag({ language, width = 28 }: FlagProps) {
  // clipPath ids must be unique per instance, since several flags can be on screen at once.
  const clipId = useId()
  const height = (width * 20) / 28

  return (
    <svg
      viewBox="0 0 28 20"
      width={width}
      height={height}
      aria-hidden="true"
      focusable="false"
      className="flag"
    >
      {language === 'pt-BR' ? (
        <>
          <rect width="28" height="20" rx="2" fill="#009C3B" />
          <path d="M14 2.5 25.5 10 14 17.5 2.5 10Z" fill="#FFDF00" />
          <circle cx="14" cy="10" r="4.6" fill="#002776" />
          <path d="M9.6 8.9c3-.9 6.3-.6 8.9 1.1l-.3.9c-2.5-1.6-5.6-1.9-8.4-1.1Z" fill="#fff" />
        </>
      ) : (
        <>
          <clipPath id={clipId}>
            <rect width="28" height="20" rx="2" />
          </clipPath>
          <g clipPath={`url(#${clipId})`}>
            <rect width="28" height="20" fill="#fff" />
            <path
              d="M0 0h28M0 3.08h28M0 6.15h28M0 9.23h28M0 12.3h28M0 15.38h28M0 18.46h28"
              stroke="#B22234"
              strokeWidth="1.54"
              transform="translate(0 .77)"
            />
            <rect width="12" height="10.77" fill="#3C3B6E" />
            <g fill="#fff">
              {[
                [2, 2],
                [5, 2],
                [8, 2],
                [11, 2],
                [3.5, 4],
                [6.5, 4],
                [9.5, 4],
                [2, 6],
                [5, 6],
                [8, 6],
                [11, 6],
                [3.5, 8],
                [6.5, 8],
                [9.5, 8],
              ].map(([cx, cy]) => (
                <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r=".6" />
              ))}
            </g>
          </g>
        </>
      )}
    </svg>
  )
}
