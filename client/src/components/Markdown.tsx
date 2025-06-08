import React from 'react';
import RecatMarkDown from 'react-markdown'
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownProps {
    content:string
}
const Markdown:React.FC<MarkdownProps> = ({content}) => {
  return (
    <RecatMarkDown
     components={{
        code({node,inline, className,children, ...props}:any){
            const match = /language-(\w+)/.exec(className || "")
            return !inline && match ? (
                <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" {...props} >
                    {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
            ): (
                <code className={className} {...props}>
                    {children}
                </code>
            )
        }
     }}
    >
      {content}
    </RecatMarkDown>
  )
}

export default Markdown