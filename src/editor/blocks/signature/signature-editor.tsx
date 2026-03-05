import React, { useState, useEffect, CSSProperties } from 'react';
import { SignatureProps, SignaturePropsDefaults } from '@blocks';
import { useCurrentBlockId } from '@editor/editor-block';
import { setDocument, useSelectedBlockId } from '@editor/editor-context';

function getImageBorderRadius(shape: string, size: number): number | undefined {
  switch (shape) {
    case 'circle':
      return size;
    case 'rounded':
      return size * 0.125;
    case 'square':
    default:
      return undefined;
  }
}

export default function SignatureEditor({ style, props }: SignatureProps) {
  const blockId = useCurrentBlockId();
  const selectedBlockId = useSelectedBlockId();
  const isSelected = selectedBlockId === blockId;

  const greeting = props?.greeting ?? SignaturePropsDefaults.greeting;
  const name = props?.name ?? SignaturePropsDefaults.name;
  const title = props?.title ?? SignaturePropsDefaults.title;
  const company = props?.company ?? SignaturePropsDefaults.company;
  const address = props?.address ?? SignaturePropsDefaults.address;
  const email = props?.email ?? SignaturePropsDefaults.email;
  const phone = props?.phone ?? SignaturePropsDefaults.phone;
  const website = props?.website ?? SignaturePropsDefaults.website;
  const imageUrl = props?.imageUrl ?? SignaturePropsDefaults.imageUrl;
  const imageSize = props?.imageSize ?? SignaturePropsDefaults.imageSize;
  const imageShape = props?.imageShape ?? SignaturePropsDefaults.imageShape;
  const layout = props?.layout ?? SignaturePropsDefaults.layout;
  const nameColor = props?.nameColor ?? SignaturePropsDefaults.nameColor;
  const textColor = props?.textColor ?? SignaturePropsDefaults.textColor;
  const linkColor = props?.linkColor ?? SignaturePropsDefaults.linkColor;

  const [localGreeting, setLocalGreeting] = useState(greeting);
  const [localName, setLocalName] = useState(name);
  const [localTitle, setLocalTitle] = useState(title);
  const [localCompany, setLocalCompany] = useState(company);
  const [localAddress, setLocalAddress] = useState(address);
  const [localEmail, setLocalEmail] = useState(email);
  const [localPhone, setLocalPhone] = useState(phone);
  const [localWebsite, setLocalWebsite] = useState(website);

  useEffect(() => { setLocalGreeting(greeting); }, [greeting]);
  useEffect(() => { setLocalName(name); }, [name]);
  useEffect(() => { setLocalTitle(title); }, [title]);
  useEffect(() => { setLocalCompany(company); }, [company]);
  useEffect(() => { setLocalAddress(address); }, [address]);
  useEffect(() => { setLocalEmail(email); }, [email]);
  useEffect(() => { setLocalPhone(phone); }, [phone]);
  useEffect(() => { setLocalWebsite(website); }, [website]);

  const updateProps = (updates: Partial<typeof props>) => {
    setDocument({
      [blockId]: {
        type: 'Signature',
        data: {
          style,
          props: { ...props, ...updates },
        },
      },
    });
  };

  const greetingStyle: CSSProperties = {
    fontSize: 14,
    color: textColor,
    margin: 0,
    marginBottom: 8,
    lineHeight: '1.4',
    fontStyle: 'italic',
  };

  const nameStyle: CSSProperties = {
    fontSize: 16,
    fontWeight: 'bold',
    color: nameColor,
    margin: 0,
    lineHeight: '1.4',
  };

  const detailStyle: CSSProperties = {
    fontSize: 14,
    color: textColor,
    margin: 0,
    lineHeight: '1.4',
  };

  const linkStyle: CSSProperties = {
    fontSize: 14,
    color: linkColor,
    textDecoration: 'none',
  };

  const inputBase: CSSProperties = {
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    width: '100%',
    padding: 0,
    margin: 0,
    fontFamily: 'inherit',
  };

  const wrapperStyle: CSSProperties = {
    backgroundColor: style?.backgroundColor ?? undefined,
    padding: style?.padding
      ? `${style.padding.top}px ${style.padding.right}px ${style.padding.bottom}px ${style.padding.left}px`
      : undefined,
  };

  const imageElement = imageUrl ? (
    <img
      src={imageUrl}
      alt={name || company}
      width={imageSize}
      height={imageSize}
      style={{
        width: imageSize,
        height: imageSize,
        objectFit: 'cover',
        borderRadius: getImageBorderRadius(imageShape, imageSize),
        display: 'block',
        outline: 'none',
        border: 'none',
      }}
    />
  ) : null;

  const greetingElement = isSelected ? (
    <div onClick={(e) => e.stopPropagation()}>
      <input
        value={localGreeting}
        onChange={(e) => { setLocalGreeting(e.target.value); updateProps({ greeting: e.target.value }); }}
        placeholder="Greeting (e.g. Best regards,)"
        style={{ ...inputBase, ...greetingStyle }}
      />
    </div>
  ) : greeting ? (
    <p style={greetingStyle}>{greeting}</p>
  ) : null;

  const textContent = isSelected ? (
    <div onClick={(e) => e.stopPropagation()}>
      <input
        value={localName}
        onChange={(e) => { setLocalName(e.target.value); updateProps({ name: e.target.value }); }}
        placeholder="Name"
        style={{ ...inputBase, ...nameStyle }}
      />
      <input
        value={localTitle}
        onChange={(e) => { setLocalTitle(e.target.value); updateProps({ title: e.target.value }); }}
        placeholder="Title"
        style={{ ...inputBase, ...detailStyle }}
      />
      <input
        value={localCompany}
        onChange={(e) => { setLocalCompany(e.target.value); updateProps({ company: e.target.value }); }}
        placeholder="Company"
        style={{ ...inputBase, ...detailStyle }}
      />
      <input
        value={localAddress}
        onChange={(e) => { setLocalAddress(e.target.value); updateProps({ address: e.target.value }); }}
        placeholder="Address"
        style={{ ...inputBase, ...detailStyle }}
      />
      <input
        value={localEmail}
        onChange={(e) => { setLocalEmail(e.target.value); updateProps({ email: e.target.value }); }}
        placeholder="Email"
        style={{ ...inputBase, ...linkStyle, marginTop: 4, display: 'block' }}
      />
      <input
        value={localPhone}
        onChange={(e) => { setLocalPhone(e.target.value); updateProps({ phone: e.target.value }); }}
        placeholder="Phone"
        style={{ ...inputBase, ...linkStyle, display: 'block' }}
      />
      <input
        value={localWebsite}
        onChange={(e) => { setLocalWebsite(e.target.value); updateProps({ website: e.target.value }); }}
        placeholder="Website"
        style={{ ...inputBase, ...linkStyle, display: 'block' }}
      />
    </div>
  ) : (
    <div>
      {name && <p style={nameStyle}>{name}</p>}
      {title && <p style={detailStyle}>{title}</p>}
      {company && <p style={detailStyle}>{company}</p>}
      {address && <p style={detailStyle}>{address}</p>}
      {(email || phone || website) && (
        <p style={{ ...detailStyle, marginTop: 4 }}>
          {email && <span style={linkStyle}>{email}</span>}
          {email && (phone || website) && <span style={detailStyle}> &middot; </span>}
          {phone && <span style={linkStyle}>{phone}</span>}
          {phone && website && <span style={detailStyle}> &middot; </span>}
          {website && <span style={linkStyle}>{website}</span>}
        </p>
      )}
      {!name && !title && !company && !email && !phone && !website && (
        <p style={detailStyle}>Click to edit signature</p>
      )}
    </div>
  );

  if (layout === 'vertical') {
    return (
      <div style={wrapperStyle}>
        {greetingElement}
        {imageElement && <div style={{ marginBottom: 12 }}>{imageElement}</div>}
        {textContent}
      </div>
    );
  }

  return (
    <div style={wrapperStyle}>
      {greetingElement}
      <table cellPadding="0" cellSpacing="0" border={0} role="presentation">
        <tbody>
          <tr>
            {imageElement && (
              <td style={{ verticalAlign: 'middle', paddingRight: 16 }}>
                {imageElement}
              </td>
            )}
            <td style={{ verticalAlign: 'middle' }}>
              {textContent}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
